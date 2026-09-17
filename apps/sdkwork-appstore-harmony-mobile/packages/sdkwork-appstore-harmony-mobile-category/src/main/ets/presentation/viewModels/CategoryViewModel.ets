import { CategoryState } from '../../state/CategoryState';

/** Presentation view model for the category capability. */
@Observed
export class CategoryViewModel {
  readonly state: CategoryState = new CategoryState();

  get capability(): string {
    return 'category';
  }
}
