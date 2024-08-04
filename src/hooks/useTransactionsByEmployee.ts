import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, clearCacheByEndpoint, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )

      setTransactionsByEmployee(data)
    },
    [fetchWithCache]
  )

  const updateTransaction = useCallback((transactionId: string, approved: boolean) => {
    setTransactionsByEmployee((prevTransactions) => 
      prevTransactions?.map((transaction) => 
        transaction.id === transactionId ? { ...transaction, approved } : transaction
      ) ?? null
    )
    clearCacheByEndpoint(["transactionsByEmployee"])
  }, [clearCacheByEndpoint])

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
    clearCacheByEndpoint(["transactionsByEmployee"])
  }, [clearCacheByEndpoint])

  return { data: transactionsByEmployee, loading, fetchById, updateTransaction, invalidateData }
}