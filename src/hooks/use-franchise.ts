import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { login } from "@/features/auth/auth-slice";
import { APIError } from "@/models/responses/api-response.model";
import { fetchUser } from "@/services/auth-service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useFranchise = () => {
    const dispatch = useAppDispatch();
    const user = useSelector((state: RootState) => state.franchise.user);
    const franchise = useSelector((state: RootState) => state.franchise.franchise);
    const isAuthenticated = useSelector((state: RootState) => state.franchise.isAuthenticated);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<APIError | null>(null);

    const checkAuth = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('my-franchise-user-token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetchUser(token);

            if (response.status === 'success' && response.data) {
                dispatch(login(response.data));
            } else if (response.status === 'error' && response.error) {
                localStorage.removeItem('my-franchise-user-token');
                setError(response.error);
            }

            setIsLoading(false);
        } catch (error) {
            localStorage.removeItem('my-franchise-user-token');
            setError(
                {
                    code: 'AUTH_ERROR',
                    description: 'Authentication error. Please try again later.'
                }
            );
            setIsLoading(false);

        }
    }
    useEffect(() => {
        checkAuth(); // Check authentication on mount
    }, []);
    return {
        isAuthenticated,
        user,
        franchise,
        isLoading,
        error,
        checkAuth
    }

}

export default useFranchise