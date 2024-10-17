import { useQuery } from "@apollo/client"
import { GET_ACTIVE_ITEMS } from "@constants/subgraphQueries"

export const useActiveItems = (onCompleted, onError) => {
    return useQuery(GET_ACTIVE_ITEMS, {
        onCompleted: (data) => {
            console.log("Active items data:", data)
            if (onCompleted) {
                onCompleted(data)
            }
        },
        onError: (error) => {
            console.error("Error fetching active items:", error)
            if (onError) {
                onError(error)
            }
        },
    })
}
