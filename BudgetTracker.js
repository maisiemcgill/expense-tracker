export default class BudgetTracker {
    constructor(querySelectorString) {
        this.root = document.querySelector(querySelectorString);

        this.root.innerHTML = BudgetTracker.html();

        this.root.querySelector(".new-entry").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });

        this.root.querySelectorAll(".filter-btn").forEach(button => {
            button.addEventListener("click", () => {
                this.applyFilter(button.dataset.filter);
            });
        });

        // Load initial data from local storage
        this.load();
    }

    static html() {
        return `
            <h1 class="main-title">Expense Tracker</h1>

            <div class="filters">
                <button type="button" class="filter-btn active" data-filter="all">
                     All
                 </button>

                 <button type="button" class="filter-btn" data-filter="income">
                     Income
                 </button>

                 <button type="button" class="filter-btn" data-filter="expense">
                     Expense
                 </button>
            </div>

            <table class="budget-tracker">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th></th>
                </tr>
            </thead>
            <tbody class="entries">
                <tr class="empty-row">
                    <td colspan="5" class="empty-state">
                        No transactions yet
                    </td>
                </tr>
            </tbody>
            <tbody>
                <tr>
                    <td colspan="5" class="controls">
                        <button type="button" class="new-entry">New Entry</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" class="summary">
                        <strong>Total:</strong>
                        <span class="total">£0.00</span>
                    </td>
                </tr>
            </tfoot>
        </table>
        `;
    }

    static entryHtml() {
        return `
                <tr>
                    <td>
                        <input class="input input-date" type="date">
                    </td>
                    <td>
                        <input class="input input-description" type="text"
                            placeholder="Add a description...">
                    </td>
                    <td>
                        <select class="input input-type">
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </td>
                    <td>
                    <input
                         type="number"
                         class="input input-amount"
                         min="0"
                         step="0.01"
                    >
                    </td>
                    <td>
                        <button type="button" class="delete-entry">&#10005;</button>
                    </td>
                </tr>
        `;
    }

    load() {
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries-dev") || "[]")
        for (const entry of entries) {
            this.addEntry(entry);
        }

        this.updateSummary();
        if (!entries.length) {
            this.root.querySelector(".entries").innerHTML = `
                 <tr class="empty-row">
                     <td colspan="5" class="empty-state">
                         No transactions yet
                     </td>
                 </tr>
    `;
        }
    }

    updateSummary() {
        const total = this.getEntryRows().reduce((total, row) => {
            const amount = row.querySelector(".input-amount").value;
            const isExpense = row.querySelector(".input-type").value === "expense";
            const modifier = isExpense ? -1 : 1;

            return total + (amount * modifier);
        }, 0);

        const totalFormatted = new Intl.NumberFormat("en-UK", {
            style: "currency",
            currency: "GBP"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }

    save() {
        const data = this.getEntryRows().map(row => {
            return {
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value) || 0,
            }
        });

        localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    }

    addEntry(entry = {}) {
        const emptyRow = this.root.querySelector(".empty-row");

        if (emptyRow) {
            emptyRow.remove();
        }
        this.root.querySelector(".entries").insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

        const row = this.root.querySelector(".entries tr:last-of-type")

        row.querySelector(".input-date").value = entry.date || new Date().toISOString().replace(/T.*/, "");
        row.querySelector(".input-description").value = entry.description || "";
        row.querySelector(".input-type").value = entry.type || "income";
        row.querySelector(".input-amount").value = entry.amount || 0;
        row.querySelector(".delete-entry").addEventListener("click", e => {
            this.onDeleteEntryBtnClick(e);
        });

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change", () => {
                this.updateSummary();
                this.save();
            });
        });
    }

    getEntryRows() {
        return Array.from(this.root.querySelectorAll(".entries tr"));
    }

    applyFilter(filter) {
        const rows = this.getEntryRows();

        this.root.querySelectorAll(".filter-btn").forEach(button => {
            button.classList.remove("active");
        });

        this.root.querySelector(`[data-filter="${filter}"]`)
            .classList.add("active");

        rows.forEach(row => {
            const type = row.querySelector(".input-type").value;

            if (filter === "all" || filter === type) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    onNewEntryBtnClick() {
        this.addEntry();
        this.updateSummary();
        this.save();
    }

    onDeleteEntryBtnClick(e) {
        e.target.closest("tr").remove();
        this.updateSummary();
        this.save();
    }

}