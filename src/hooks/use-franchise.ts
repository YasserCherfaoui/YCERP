import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { login } from "@/features/auth/franchise-slice";
import { APIError } from "@/models/responses/api-response.model";
import { getMyAdminFranchise } from "@/services/franchise-service";
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
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await getMyAdminFranchise(token);

            if (response.status === 'success' && response.data) {
                dispatch(login(response.data));
            } else if (response.status === 'error' && response.error) {
                localStorage.removeItem('token');
                setError(response.error);
            }

            setIsLoading(false);
        } catch (error) {
            localStorage.removeItem('token');
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