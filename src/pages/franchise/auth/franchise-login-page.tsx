import { useAppDispatch } from "@/app/hooks";
import FranchiseAuthLoginForm from "@/components/feature-specific/franchise-auth/franchise-auth-login-form";
import { login } from "@/features/auth/franchise-slice";
import { useToast } from "@/hooks/use-toast";
import { getMyAdminFranchise } from "@/services/franchise-service";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function FranchiseLoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loggingInWithToken, setLoggingInWithToken] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    setLoggingInWithToken(true);
    getMyAdminFranchise(token)
      .then((res) => {
        localStorage.setItem("token", token);
        dispatch(login(res.data));
        setSearchParams({}, { replace: true });
        navigate("/myFranchise", { replace: true });
      })
      .catch((err) => {
        toast({
          title: "Login failed",
          description: err.message ?? "Invalid or expired token",
          variant: "destructive",
        });
        setSearchParams({}, { replace: true });
        setLoggingInWithToken(false);
      });
  }, [token]);

  if (loggingInWithToken) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-muted-foreground">Logging you in…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <FranchiseAuthLoginForm />
    </div>
  );
}
