//! Dialect-aware SQLx query wrappers (SQLite + PostgreSQL).

use std::marker::PhantomData;

use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Sqlite};

use crate::db::dialect::adapt_sql;
use crate::pool::{AppstoreDbPool, AppstoreSqlxDb};

/// Unified execute result (rows affected).
pub struct AppstoreExecuteResult {
    pub rows_affected: u64,
}

impl AppstoreExecuteResult {
    pub fn rows_affected(&self) -> u64 {
        self.rows_affected
    }
}

#[doc(hidden)]
#[derive(Clone)]
pub enum SqlBind {
    Text(String),
    I32(i32),
    I64(i64),
    F64(String),
    Bool(i32),
    OptText(Option<String>),
    OptI32(Option<i32>),
    DateTime(DateTime<Utc>),
    OptDateTime(Option<DateTime<Utc>>),
    Bytes(Vec<u8>),
}

impl SqlBind {
    fn bind_sqlite<'q>(
        &'q self,
        query: sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments>,
    ) -> sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments> {
        match self {
            SqlBind::Text(v) => query.bind(v),
            SqlBind::I32(v) => query.bind(v),
            SqlBind::I64(v) => query.bind(v),
            SqlBind::F64(v) => query.bind(v),
            SqlBind::Bool(v) => query.bind(v),
            SqlBind::OptText(v) => query.bind(v),
            SqlBind::OptI32(v) => query.bind(v),
            SqlBind::DateTime(v) => query.bind(v),
            SqlBind::OptDateTime(v) => query.bind(v),
            SqlBind::Bytes(v) => query.bind(v),
        }
    }

    fn bind_postgres<'q>(
        &'q self,
        query: sqlx::query::Query<'q, Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, Postgres, sqlx::postgres::PgArguments> {
        match self {
            SqlBind::Text(v) => query.bind(v),
            SqlBind::I32(v) => query.bind(v),
            SqlBind::I64(v) => query.bind(v),
            SqlBind::F64(v) => query.bind(v),
            SqlBind::Bool(v) => query.bind(v),
            SqlBind::OptText(v) => query.bind(v),
            SqlBind::OptI32(v) => query.bind(v),
            SqlBind::DateTime(v) => query.bind(v),
            SqlBind::OptDateTime(v) => query.bind(v),
            SqlBind::Bytes(v) => query.bind(v),
        }
    }

    fn bind_sqlite_as<'q, O>(
        &'q self,
        query: sqlx::query::QueryAs<'q, Sqlite, O, sqlx::sqlite::SqliteArguments>,
    ) -> sqlx::query::QueryAs<'q, Sqlite, O, sqlx::sqlite::SqliteArguments> {
        match self {
            SqlBind::Text(v) => query.bind(v),
            SqlBind::I32(v) => query.bind(v),
            SqlBind::I64(v) => query.bind(v),
            SqlBind::F64(v) => query.bind(v),
            SqlBind::Bool(v) => query.bind(v),
            SqlBind::OptText(v) => query.bind(v),
            SqlBind::OptI32(v) => query.bind(v),
            SqlBind::DateTime(v) => query.bind(v),
            SqlBind::OptDateTime(v) => query.bind(v),
            SqlBind::Bytes(v) => query.bind(v),
        }
    }

    fn bind_postgres_as<'q, O>(
        &'q self,
        query: sqlx::query::QueryAs<'q, Postgres, O, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::QueryAs<'q, Postgres, O, sqlx::postgres::PgArguments> {
        match self {
            SqlBind::Text(v) => query.bind(v),
            SqlBind::I32(v) => query.bind(v),
            SqlBind::I64(v) => query.bind(v),
            SqlBind::F64(v) => query.bind(v),
            SqlBind::Bool(v) => query.bind(v),
            SqlBind::OptText(v) => query.bind(v),
            SqlBind::OptI32(v) => query.bind(v),
            SqlBind::DateTime(v) => query.bind(v),
            SqlBind::OptDateTime(v) => query.bind(v),
            SqlBind::Bytes(v) => query.bind(v),
        }
    }
}

pub enum AppstoreTransaction<'a> {
    Sqlite(sqlx::Transaction<'a, Sqlite>),
    Postgres(sqlx::Transaction<'a, Postgres>),
}

pub struct AppstoreQuery {
    db: AppstoreSqlxDb,
    sql: String,
    binds: Vec<SqlBind>,
}

pub struct AppstoreQueryAs<O> {
    _db: AppstoreSqlxDb,
    sql: String,
    binds: Vec<SqlBind>,
    _marker: PhantomData<O>,
}

impl AppstoreSqlxDb {
    pub fn query(&self, template: &str) -> AppstoreQuery {
        AppstoreQuery {
            db: self.clone(),
            sql: template.to_string(),
            binds: Vec::new(),
        }
    }

    pub fn query_as<O>(&self, template: &str) -> AppstoreQueryAs<O> {
        AppstoreQueryAs {
            _db: self.clone(),
            sql: template.to_string(),
            binds: Vec::new(),
            _marker: PhantomData,
        }
    }

    pub async fn begin(&self) -> sqlx::Result<AppstoreTransaction<'_>> {
        match &self.pool {
            AppstoreDbPool::Sqlite(pool) => Ok(AppstoreTransaction::Sqlite(pool.begin().await?)),
            AppstoreDbPool::Postgres(pool) => {
                Ok(AppstoreTransaction::Postgres(pool.begin().await?))
            }
        }
    }

    fn adapted_sql(&self, template: &str) -> String {
        adapt_sql(template, self.dialect)
    }
}

impl AppstoreTransaction<'_> {
    pub async fn commit(self) -> sqlx::Result<()> {
        match self {
            AppstoreTransaction::Sqlite(tx) => tx.commit().await,
            AppstoreTransaction::Postgres(tx) => tx.commit().await,
        }
    }

    pub async fn rollback(self) -> sqlx::Result<()> {
        match self {
            AppstoreTransaction::Sqlite(tx) => tx.rollback().await,
            AppstoreTransaction::Postgres(tx) => tx.rollback().await,
        }
    }
}

impl AppstoreQuery {
    pub fn bind(mut self, value: impl BindValue) -> Self {
        self.binds.push(value.into_sql_bind());
        self
    }

    fn apply_binds_sqlite<'q>(
        &'q self,
        mut query: sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments>,
    ) -> sqlx::query::Query<'q, Sqlite, sqlx::sqlite::SqliteArguments> {
        for bind in &self.binds {
            query = bind.bind_sqlite(query);
        }
        query
    }

    fn apply_binds_postgres<'q>(
        &'q self,
        mut query: sqlx::query::Query<'q, Postgres, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::Query<'q, Postgres, sqlx::postgres::PgArguments> {
        for bind in &self.binds {
            query = bind.bind_postgres(query);
        }
        query
    }

    pub async fn execute_unified(self, db: &AppstoreSqlxDb) -> sqlx::Result<AppstoreExecuteResult> {
        let sql = db.adapted_sql(&self.sql);
        match &db.pool {
            AppstoreDbPool::Sqlite(pool) => {
                let query = self.apply_binds_sqlite(sqlx::query(sqlx::AssertSqlSafe(sql.as_str())));
                let result = query.execute(pool).await?;
                Ok(AppstoreExecuteResult {
                    rows_affected: result.rows_affected(),
                })
            }
            AppstoreDbPool::Postgres(pool) => {
                let query =
                    self.apply_binds_postgres(sqlx::query(sqlx::AssertSqlSafe(sql.as_str())));
                let result = query.execute(pool).await?;
                Ok(AppstoreExecuteResult {
                    rows_affected: result.rows_affected(),
                })
            }
        }
    }

    pub async fn execute_tx(
        self,
        tx: &mut AppstoreTransaction<'_>,
    ) -> sqlx::Result<AppstoreExecuteResult> {
        let sql = self.db.adapted_sql(&self.sql);
        match (tx, &self.db.pool) {
            (AppstoreTransaction::Sqlite(tx), AppstoreDbPool::Sqlite(_)) => {
                let query = self.apply_binds_sqlite(sqlx::query(sqlx::AssertSqlSafe(sql.as_str())));
                let result = query.execute(&mut **tx).await?;
                Ok(AppstoreExecuteResult {
                    rows_affected: result.rows_affected(),
                })
            }
            (AppstoreTransaction::Postgres(tx), AppstoreDbPool::Postgres(_)) => {
                let query =
                    self.apply_binds_postgres(sqlx::query(sqlx::AssertSqlSafe(sql.as_str())));
                let result = query.execute(&mut **tx).await?;
                Ok(AppstoreExecuteResult {
                    rows_affected: result.rows_affected(),
                })
            }
            _ => Err(sqlx::Error::Configuration(
                "AppstoreQuery transaction engine mismatch".into(),
            )),
        }
    }
}

impl<O> AppstoreQueryAs<O> {
    pub fn bind(mut self, value: impl BindValue) -> Self {
        self.binds.push(value.into_sql_bind());
        self
    }

    fn apply_binds_sqlite<'q>(
        &'q self,
        mut query: sqlx::query::QueryAs<'q, Sqlite, O, sqlx::sqlite::SqliteArguments>,
    ) -> sqlx::query::QueryAs<'q, Sqlite, O, sqlx::sqlite::SqliteArguments> {
        for bind in &self.binds {
            query = bind.bind_sqlite_as(query);
        }
        query
    }

    fn apply_binds_postgres<'q>(
        &'q self,
        mut query: sqlx::query::QueryAs<'q, Postgres, O, sqlx::postgres::PgArguments>,
    ) -> sqlx::query::QueryAs<'q, Postgres, O, sqlx::postgres::PgArguments> {
        for bind in &self.binds {
            query = bind.bind_postgres_as(query);
        }
        query
    }

    pub async fn fetch_optional(self, db: &AppstoreSqlxDb) -> sqlx::Result<Option<O>>
    where
        O: for<'r> FromRow<'r, sqlx::sqlite::SqliteRow>
            + for<'r> FromRow<'r, sqlx::postgres::PgRow>
            + Send
            + Unpin,
    {
        let sql = db.adapted_sql(&self.sql);
        match &db.pool {
            AppstoreDbPool::Sqlite(pool) => {
                let query =
                    self.apply_binds_sqlite(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_optional(pool).await
            }
            AppstoreDbPool::Postgres(pool) => {
                let query =
                    self.apply_binds_postgres(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_optional(pool).await
            }
        }
    }

    pub async fn fetch_all(self, db: &AppstoreSqlxDb) -> sqlx::Result<Vec<O>>
    where
        O: for<'r> FromRow<'r, sqlx::sqlite::SqliteRow>
            + for<'r> FromRow<'r, sqlx::postgres::PgRow>
            + Send
            + Unpin,
    {
        let sql = db.adapted_sql(&self.sql);
        match &db.pool {
            AppstoreDbPool::Sqlite(pool) => {
                let query =
                    self.apply_binds_sqlite(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_all(pool).await
            }
            AppstoreDbPool::Postgres(pool) => {
                let query =
                    self.apply_binds_postgres(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_all(pool).await
            }
        }
    }

    pub async fn fetch_one(self, db: &AppstoreSqlxDb) -> sqlx::Result<O>
    where
        O: for<'r> FromRow<'r, sqlx::sqlite::SqliteRow>
            + for<'r> FromRow<'r, sqlx::postgres::PgRow>
            + Send
            + Unpin,
    {
        let sql = db.adapted_sql(&self.sql);
        match &db.pool {
            AppstoreDbPool::Sqlite(pool) => {
                let query =
                    self.apply_binds_sqlite(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_one(pool).await
            }
            AppstoreDbPool::Postgres(pool) => {
                let query =
                    self.apply_binds_postgres(sqlx::query_as(sqlx::AssertSqlSafe(sql.as_str())));
                query.fetch_one(pool).await
            }
        }
    }
}

pub trait BindValue {
    fn into_sql_bind(self) -> SqlBind;
}

impl BindValue for &str {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Text(self.to_string())
    }
}

impl BindValue for String {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Text(self)
    }
}

impl BindValue for &String {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Text(self.clone())
    }
}

impl BindValue for i32 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::I32(self)
    }
}

impl BindValue for i64 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::I64(self)
    }
}

impl BindValue for bool {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Bool(if self { 1 } else { 0 })
    }
}

impl BindValue for DateTime<Utc> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::DateTime(self)
    }
}

impl BindValue for &DateTime<Utc> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::DateTime(*self)
    }
}

impl BindValue for Option<String> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptText(self)
    }
}

impl BindValue for &Option<String> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptText(self.clone())
    }
}

impl BindValue for Option<i32> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptI32(self)
    }
}

impl BindValue for &Option<i32> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptI32(self.clone())
    }
}

impl BindValue for Option<&str> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptText(self.map(str::to_string))
    }
}

impl BindValue for Option<DateTime<Utc>> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptDateTime(self)
    }
}

impl BindValue for &Option<DateTime<Utc>> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::OptDateTime(self.clone())
    }
}

impl BindValue for Vec<u8> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Bytes(self)
    }
}

impl BindValue for &Vec<u8> {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::Bytes(self.clone())
    }
}

impl BindValue for f64 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::F64(self.to_string())
    }
}

impl BindValue for &f64 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::F64(self.to_string())
    }
}

// Repository code binds `if flag { 1 } else { 0 }` as i32 literals.
impl BindValue for &i32 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::I32(*self)
    }
}

impl BindValue for &i64 {
    fn into_sql_bind(self) -> SqlBind {
        SqlBind::I64(*self)
    }
}

#[macro_export]
macro_rules! db_fetch_optional {
    ($db:expr, $ty:ty, $sql:expr $(, $bind:expr)* $(,)?) => {{
        $db.query_as::<$ty>($sql)
            $(.bind($bind))*
            .fetch_optional($db)
            .await
    }};
}

#[macro_export]
macro_rules! db_fetch_all {
    ($db:expr, $ty:ty, $sql:expr $(, $bind:expr)* $(,)?) => {{
        $db.query_as::<$ty>($sql)
            $(.bind($bind))*
            .fetch_all($db)
            .await
    }};
}

#[macro_export]
macro_rules! db_fetch_one {
    ($db:expr, $ty:ty, $sql:expr $(, $bind:expr)* $(,)?) => {{
        $db.query_as::<$ty>($sql)
            $(.bind($bind))*
            .fetch_one($db)
            .await
    }};
}

#[macro_export]
macro_rules! db_execute {
    ($db:expr, $sql:expr $(, $bind:expr)* $(,)?) => {{
        $db.query($sql)
            $(.bind($bind))*
            .execute_unified($db)
            .await
    }};
}
