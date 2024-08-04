import { useCallback } from "react"
import { Transaction } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"

export function Transactions({
  transactions,
  loading,
  onApprove,
}: {
  transactions: Transaction[] | null
  loading: boolean
  onApprove: (transactionId: string, newValue: boolean) => Promise<void>
}) {
  const setTransactionApproval = useCallback(
    async (params: { transactionId: string; newValue: boolean }) => {
      await onApprove(params.transactionId, params.newValue)
    },
    [onApprove]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
