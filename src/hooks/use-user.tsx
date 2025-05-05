import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { login } from "@/features/auth/user-slice";
import { APIError } from "@/models/responses/api-response.model";
import { getUserProfile } from "@/services/user-service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useUser = () => {
    const dispatch = useAppDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const franchise = useSelector((state: RootState) => state.user.franchise);
    const company = useSelector((state: RootState) => state.user.company);
    const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
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

            const response = await getUserProfile(token);

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
        company,
        isLoading,
        error,
        checkAuth
    }

}

export default useUser