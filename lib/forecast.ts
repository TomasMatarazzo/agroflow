export type CashFlowType = "income" | "expense";
export type CashFlowStatus = "pending" | "completed";
export const categories = ["Granos", "Ganadería", "Insumos", "Maquinaria", "Servicios", "Impuestos", "Otros"] as const;
export type Category = (typeof categories)[number];

export interface Movement {
  id: string;
  concept: string;
  type: CashFlowType;
  category: Category;
  amount: number;
  dueDate: string; // Local YYYY-MM-DD
  status: CashFlowStatus;
}

export interface CashWeek {
  week: number;
  start: string;
  end: string;
  opening: number;
  income: number;
  expense: number;
  closing: number;
  items: Movement[];
  overdueItems: number;
}

export function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return [year, month, day].join("-");
}

export function fromISO(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toISO(date) === value ? date : null;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const day = (date.getDay() + 6) % 7; // Monday = 0
  return addDays(date, -day);
}

export function isMovement(value: unknown): value is Movement {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Partial<Movement>;
  return typeof m.id === "string" && m.id.length > 0 &&
    typeof m.concept === "string" && m.concept.trim().length > 0 && m.concept.length <= 120 &&
    (m.type === "income" || m.type === "expense") &&
    (m.status === "pending" || m.status === "completed") &&
    categories.includes(m.category as Category) &&
    typeof m.amount === "number" && Number.isFinite(m.amount) && m.amount > 0 &&
    typeof m.dueDate === "string" && fromISO(m.dueDate) !== null;
}

/**
 * Opening balance is the current account balance. Completed payments are assumed
 * to be reflected in it already and must not be counted twice.
 * Every pending item with an overdue date is carried into the first week.
 */
export function forecast(
  movements: Movement[],
  openingBalance: number,
  today: Date,
  horizon = 13,
): CashWeek[] {
  if (!Number.isFinite(openingBalance)) throw new Error("Invalid opening balance");
  if (!Number.isInteger(horizon) || horizon < 1 || horizon > 104) throw new Error("Invalid horizon");
  const monday = startOfWeek(today);
  const todayISO = toISO(today);
  let balance = openingBalance;

  return Array.from({ length: horizon }, (_, index) => {
    const start = toISO(addDays(monday, index * 7));
    const end = toISO(addDays(monday, index * 7 + 6));
    const items = movements.filter((movement) => {
      if (!isMovement(movement) || movement.status !== "pending") return false;
      // Including past-due records exactly once is intentional (week 1).
      return index === 0 ? movement.dueDate <= end : movement.dueDate >= start && movement.dueDate <= end;
    });
    const income = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expense = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    const opening = balance;
    balance += income - expense;
    return {
      week: index + 1,
      start, end, opening, income, expense, closing: balance, items,
      overdueItems: index === 0 ? items.filter((item) => item.dueDate < todayISO).length : 0,
    };
  });
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount);
}
