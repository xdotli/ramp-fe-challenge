import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, clearCacheByEndpoint, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return response
      }

      return {
        data: previousResponse === null ? response.data : [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      }
    })
  }, [fetchWithCache, paginatedTransactions])

  const updateTransaction = useCallback((transactionId: string, approved: boolean) => {
    setPaginatedTransactions((prevPaginatedTransactions) => {
      if (!prevPaginatedTransactions) return null
      return {
        ...prevPaginatedTransactions,
        data: prevPaginatedTransactions.data.map((transaction) => 
          transaction.id === transactionId ? { ...transaction, approved } : transaction
        )
      }
    })
    clearCacheByEndpoint(["paginatedTransactions"])
  }, [clearCacheByEndpoint])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
    clearCacheByEndpoint(["paginatedTransactions"])
  }, [clearCacheByEndpoint])

  return { data: paginatedTransactions, loading, fetchAll, updateTransaction, invalidateData }
}
