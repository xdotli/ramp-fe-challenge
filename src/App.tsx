import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, loading: employeesLoading, fetchAll: fetchAllEmployees } = useEmployees()
  const {
    data: paginatedTransactions,
    loading: paginatedTransactionsLoading,
    ...paginatedTransactionsUtils
  } = usePaginatedTransactions()
  const {
    data: transactionsByEmployee,
    loading: transactionsByEmployeeLoading,
    ...transactionsByEmployeeUtils
  } = useTransactionsByEmployee()
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsTransactionsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await paginatedTransactionsUtils.fetchAll()

    setIsTransactionsLoading(false)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      setIsTransactionsLoading(true)
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setIsTransactionsLoading(false)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    async function loadEmployeesAndTransactions() {
      await fetchAllEmployees()
      await loadAllTransactions()
    }

    if (employees === null && !employeesLoading) {
      loadEmployeesAndTransactions()
    }
  }, [employees, employeesLoading, fetchAllEmployees, loadAllTransactions])

  const updateTransactionApproval = useCallback(
    async (transactionId: string, newValue: boolean) => {
      await paginatedTransactionsUtils.updateTransaction(transactionId, newValue)
      await transactionsByEmployeeUtils.updateTransaction(transactionId, newValue)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
            transactions={transactions}
            loading={
              isTransactionsLoading || paginatedTransactionsLoading || transactionsByEmployeeLoading
            }
            onApprove={updateTransactionApproval}
          />

          {transactions !== null && paginatedTransactions?.nextPage && (
            <button
              className="RampButton"
              disabled={isTransactionsLoading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
