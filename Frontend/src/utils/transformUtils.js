import { formatDate } from "./dateUtils";
import { formatCurrency, capitalize } from "./formatUtils";

export const mapUser = (user) => ({
  ...user,
  name: capitalize(user.name),
  createdAtText: formatDate(user.createdAt),
  salaryText: formatCurrency(user.salary),
});
