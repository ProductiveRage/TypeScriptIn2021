type RetrievalResponse<T> =
  | null // Data not available yet
  | T // Data has arria
  | Error // Retrieval failed

export default RetrievalResponse
