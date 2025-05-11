import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { loginAdministrator } from "@/features/auth/franchise-slice";
import { FranchiseAdministrator } from "@/models/data/administrator.model";
import { APIError } from "@/models/responses/api-response.model";
import { fetchUser } from "@/services/auth-service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useSuperFranchise = (franchiseID: number) => {
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

            const { data, status, error } = await fetchUser(token);


            if (status === 'success' && data) {
                const {
                    ID, CreatedAt, UpdatedAt, DeletedAt,
                    full_name, email, companies
                } = data;

                for (let company of companies) {
                    for (let franchise of (company?.franchises ?? [])) {
                        if (franchise.ID === franchiseID) {
                            dispatch(loginAdministrator({
                                ID, CreatedAt, UpdatedAt, DeletedAt,
                                full_name, email, administrator_id: ID,
                                franchise_id: franchiseID, franchise,
                            } as FranchiseAdministrator));
                            break;
                        }
                    }
                }

            } else if (status === 'error' && error) {
                localStorage.removeItem('token');
                setError(error);
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

export default useSuperFranchise