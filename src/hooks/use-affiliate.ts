import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { loginAffiliate, logoutAffiliate } from "@/features/auth/affiliate-slice";
import { getAffiliateProfile } from "@/services/affiliate-service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useAffiliate = () => {
    const dispatch = useAppDispatch();
    const affiliate = useSelector((state: RootState) => state.affiliate.affiliate);
    const isAuthenticated = useSelector((state: RootState) => !!state.affiliate.token);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("affiliate_token");
            if (!token) {
                setIsLoading(false);
                return;
            }
            const response = await getAffiliateProfile();
            if (response.status === "success" && response.data) {
                dispatch(loginAffiliate.fulfilled({ token, affiliate: response.data }, "", {}));
            } else if (response.status === "error" && response.error) {
                localStorage.removeItem("affiliate_token");
                setError(response.error.description || String(response.error));
                dispatch(logoutAffiliate());
            }
            setIsLoading(false);
        } catch (err) {
            localStorage.removeItem("affiliate_token");
            setError("Authentication error. Please try again later.");
            dispatch(logoutAffiliate());
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth(); // Check authentication on mount
        // eslint-disable-next-line
    }, []);

    return {
        isAuthenticated,
        affiliate,
        isLoading,
        error,
        checkAuth,
    };
};

export default useAffiliate; 