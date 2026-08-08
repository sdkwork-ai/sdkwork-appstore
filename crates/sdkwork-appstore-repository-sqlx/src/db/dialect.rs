//! SQL placeholder adaptation for SQLite (`?`) and PostgreSQL (`$n`).
//!
//! The `?jsonb` marker binds a text value into a JSONB column: PostgreSQL
//! rewrites it to `$n::jsonb`, SQLite keeps the plain `?` placeholder.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppstoreSqlDialect {
    Sqlite,
    Postgres,
}

impl AppstoreSqlDialect {
    pub fn from_database_url(url: &str) -> Self {
        if url.starts_with("postgres://") || url.starts_with("postgresql://") {
            Self::Postgres
        } else {
            Self::Sqlite
        }
    }
}

/// Rewrites `?` placeholders to `$1`, `$2`, … for PostgreSQL; leaves SQLite SQL unchanged.
pub fn adapt_sql(template: &str, dialect: AppstoreSqlDialect) -> String {
    match dialect {
        AppstoreSqlDialect::Sqlite => adapt_sql_sqlite(template),
        AppstoreSqlDialect::Postgres => adapt_sql_postgres(template),
    }
}

fn adapt_sql_sqlite(template: &str) -> String {
    let adapted = adapt_sqlite_syntax(template);
    let mut out = String::with_capacity(adapted.len());
    let mut rest = adapted.as_str();
    while let Some(offset) = rest.find('?') {
        out.push_str(&rest[..offset]);
        rest = &rest[offset..];
        if rest.starts_with("?jsonb") && is_identifier_boundary(rest.as_bytes().get(6)) {
            out.push('?');
            rest = &rest[6..];
        } else {
            out.push('?');
            rest = &rest[1..];
        }
    }
    out.push_str(rest);
    out
}

/// Translates PostgreSQL-only syntax used by repository templates into
/// SQLite-compatible SQL:
/// - `expr::text` → `CAST(expr AS TEXT)`
/// - `expr->>'key'` → `json_extract(expr, '$.key')`
/// - `expr::numeric` → `expr` (SQLite aggregates already return REAL)
fn adapt_sqlite_syntax(template: &str) -> String {
    // First strip `::numeric` casts (keep the inner expression), then rewrite
    // `::text` and `->>` so expressions containing stripped casts stay intact.
    let stripped = strip_numeric_casts(template);
    rewrite_sqlite_syntax(&stripped)
}

fn strip_numeric_casts(template: &str) -> String {
    let chars: Vec<char> = template.chars().collect();
    let mut out = String::with_capacity(template.len());
    let mut i = 0usize;
    while i < chars.len() {
        if chars[i] == ':' && chars.get(i + 1) == Some(&':') {
            let mut j = i + 2;
            while j < chars.len() && chars[j].is_ascii_alphanumeric() {
                j += 1;
            }
            let keyword: String = chars[i + 2..j].iter().collect();
            if keyword == "numeric" {
                i = j;
                continue;
            }
        }
        out.push(chars[i]);
        i += 1;
    }
    out
}

fn rewrite_sqlite_syntax(template: &str) -> String {
    let chars: Vec<char> = template.chars().collect();
    let mut out = String::with_capacity(template.len() * 2);
    let mut i = 0usize;
    while i < chars.len() {
        if i + 2 < chars.len() && chars[i] == '-' && chars[i + 1] == '>' && chars[i + 2] == '>' {
            if let Some(quote) = chars.get(i + 3).copied() {
                if quote == '\'' {
                    let mut j = i + 4;
                    while j < chars.len() && chars[j] != quote {
                        j += 1;
                    }
                    if j < chars.len() {
                        let key: String = chars[i + 4..j].iter().collect();
                        let start = expression_start(&chars, i);
                        let expr: String = chars[start..i].iter().collect();
                        // remove the already-emitted expression characters
                        out.truncate(out.len() - expr.len());
                        out.push_str(&format!("json_extract({}, '$.{}')", expr, key));
                        i = j + 1;
                        continue;
                    }
                }
            }
        }
        if chars[i] == ':' && chars.get(i + 1) == Some(&':') {
            let mut j = i + 2;
            while j < chars.len() && chars[j].is_ascii_alphanumeric() {
                j += 1;
            }
            let keyword: String = chars[i + 2..j].iter().collect();
            match keyword.as_str() {
                "text" => {
                    let start = expression_start(&chars, i);
                    let expr: String = chars[start..i].iter().collect();
                    out.truncate(out.len() - expr.len());
                    out.push_str(&format!("CAST({} AS TEXT)", expr));
                    i = j;
                    continue;
                }
                _ => {}
            }
        }
        out.push(chars[i]);
        i += 1;
    }
    out
}

fn expression_start(chars: &[char], end: usize) -> usize {
    let mut start = end;
    let mut depth = 0i32;
    while start > 0 {
        let previous = chars[start - 1];
        if previous == ')' {
            depth += 1;
        } else if previous == '(' {
            if depth > 0 {
                depth -= 1;
            } else {
                break;
            }
        } else if depth == 0
            && (previous == ' '
                || previous == '\t'
                || previous == '\n'
                || previous == ','
                || previous == '\''
                || previous == '"'
                || previous == '='
                || previous == '<'
                || previous == '>'
                || previous == '!')
        {
            break;
        }
        start -= 1;
    }
    start
}

fn adapt_sql_postgres(template: &str) -> String {
    let mut out = String::with_capacity(template.len());
    let mut index = 1usize;
    let mut rest = template;
    while let Some(offset) = rest.find('?') {
        out.push_str(&rest[..offset]);
        rest = &rest[offset..];
        if rest.starts_with("?jsonb") && is_identifier_boundary(rest.as_bytes().get(6)) {
            out.push('$');
            out.push_str(&index.to_string());
            out.push_str("::jsonb");
            rest = &rest[6..];
        } else {
            out.push('$');
            out.push_str(&index.to_string());
            rest = &rest[1..];
        }
        index += 1;
    }
    out.push_str(rest);
    out
}

fn is_identifier_boundary(next: Option<&u8>) -> bool {
    match next {
        None => true,
        Some(byte) => !byte.is_ascii_alphanumeric() && *byte != b'_',
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adapt_sql_sqlite_passthrough() {
        assert_eq!(
            adapt_sql(
                "SELECT * FROM appstore_listing WHERE id = ?",
                AppstoreSqlDialect::Sqlite
            ),
            "SELECT * FROM appstore_listing WHERE id = ?",
        );
    }

    #[test]
    fn adapt_sql_postgres_rewrites_placeholders() {
        assert_eq!(
            adapt_sql(
                "SELECT * FROM appstore_listing WHERE id = ? AND slug = ?",
                AppstoreSqlDialect::Postgres,
            ),
            "SELECT * FROM appstore_listing WHERE id = $1 AND slug = $2",
        );
    }

    #[test]
    fn adapt_sql_sqlite_keeps_jsonb_marker_plain() {
        assert_eq!(
            adapt_sql(
                "INSERT INTO t (metadata) VALUES (?jsonb)",
                AppstoreSqlDialect::Sqlite,
            ),
            "INSERT INTO t (metadata) VALUES (?)",
        );
    }

    #[test]
    fn adapt_sql_postgres_casts_jsonb_marker() {
        assert_eq!(
            adapt_sql(
                "INSERT INTO t (id, metadata) VALUES (?, ?jsonb)",
                AppstoreSqlDialect::Postgres,
            ),
            "INSERT INTO t (id, metadata) VALUES ($1, $2::jsonb)",
        );
    }

    #[test]
    fn dialect_from_url() {
        assert_eq!(
            AppstoreSqlDialect::from_database_url("postgresql://localhost/appstore"),
            AppstoreSqlDialect::Postgres,
        );
        assert_eq!(
            AppstoreSqlDialect::from_database_url("sqlite://./appstore.db"),
            AppstoreSqlDialect::Sqlite,
        );
    }

    #[test]
    fn sqlite_translates_pg_type_casts() {
        assert_eq!(
            adapt_sql(
                "SELECT t.tenant_id::text, COALESCE(t.metadata::text, '{}') FROM appstore_app_template t",
                AppstoreSqlDialect::Sqlite,
            ),
            "SELECT CAST(t.tenant_id AS TEXT), COALESCE(CAST(t.metadata AS TEXT), '{}') FROM appstore_app_template t",
        );
    }

    #[test]
    fn sqlite_translates_json_operator() {
        assert_eq!(
            adapt_sql(
                "WHERE usage_type = 1 AND metadata->>'action' IS DISTINCT FROM 'unstar'",
                AppstoreSqlDialect::Sqlite,
            ),
            "WHERE usage_type = 1 AND json_extract(metadata, '$.action') IS DISTINCT FROM 'unstar'",
        );
    }

    #[test]
    fn sqlite_translates_numeric_rounding() {
        assert_eq!(
            adapt_sql(
                "SELECT ROUND(AVG(rating)::numeric, 1)::text FROM appstore_listing_rating",
                AppstoreSqlDialect::Sqlite,
            ),
            "SELECT CAST(ROUND(AVG(rating), 1) AS TEXT) FROM appstore_listing_rating",
        );
    }

    #[test]
    fn sqlite_keeps_plain_placeholders() {
        assert_eq!(
            adapt_sql(
                "SELECT id FROM appstore_listing WHERE tenant_id = ? AND id = ?",
                AppstoreSqlDialect::Sqlite,
            ),
            "SELECT id FROM appstore_listing WHERE tenant_id = ? AND id = ?",
        );
    }
}
