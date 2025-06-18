import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { login } from "@/features/auth/delivery-slice";

import { APIError } from "@/models/responses/api-response.model";
import { getDeliveryEmployee } from "@/services/delivery-service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useDelivery = () => {
    const dispatch = useAppDispatch();
    const deliveryEmployee = useSelector((state: RootState) => state.delivery.delivery_employee);
    const isAuthenticated = useSelector((state: RootState) => state.delivery.isAuthenticated);
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

            const response = await getDeliveryEmployee(token);

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
        deliveryEmployee,
        isLoading,
        error,
        checkAuth
    }

}

export default useDelivery;