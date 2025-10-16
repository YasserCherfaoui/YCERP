import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    RequestPasswordResetSchema,
    ResetPasswordSchema,
    VerifyOTPSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    verifyOTPSchema,
} from "@/schemas/affiliate";
import {
    requestPasswordReset,
    resetPassword,
    verifyOTP
} from "@/services/affiliate-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

type ForgotPasswordStep = "email" | "verify" | "reset";

export const AffiliateForgotPasswordPage = () => {
    const [step, setStep] = useState<ForgotPasswordStep>("email");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const handleOTPChange = (value: string, onChange: (value: string) => void) => {
        // Only allow numbers and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        onChange(numericValue);
    };

    const emailForm = useForm<RequestPasswordResetSchema>({
        resolver: zodResolver(requestPasswordResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const otpForm = useForm<VerifyOTPSchema>({
        resolver: zodResolver(verifyOTPSchema),
        defaultValues: {
            email: "",
            otp_code: "",
        },
    });

    const passwordForm = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            verification_token: "",
            new_password: "",
        },
    });


    const handleRequestReset = async (values: RequestPasswordResetSchema) => {
        setIsLoading(true);
        try {
            await requestPasswordReset(values);
            setEmail(values.email);
            // Reset the OTP form with proper values
            otpForm.reset({
                email: values.email,
                otp_code: "",
            });
            setStep("verify");
            toast({
                title: "Reset code sent",
                description: "If the email exists, a password reset code has been sent.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) return;
        
        setIsLoading(true);
        try {
            await requestPasswordReset({ email });
            toast({
                title: "Code resent",
                description: "A new reset code has been sent to your email.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to resend code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (values: VerifyOTPSchema) => {
        setIsLoading(true);
        try {
            const response = await verifyOTP(values);
            if (response.data?.verification_token) {
                const token = response.data.verification_token;
                console.log("Received verification token:", token);
                setVerificationToken(token);
                // Clear the OTP form completely
                otpForm.reset();
                setStep("reset");
                // Use setTimeout to ensure the state is updated before setting form values
                setTimeout(() => {
                    console.log("Current verification token state:", token);
                    passwordForm.reset();
                    passwordForm.setValue("verification_token", token);
                    passwordForm.setValue("new_password", "");
                    setShowPassword(false);
                    console.log("Form values after setting token:", passwordForm.getValues());
                }, 100);
                toast({
                    title: "OTP verified",
                    description: "Please enter your new password.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Invalid OTP code. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (values: ResetPasswordSchema) => {
        console.log("Reset password form submitted with values:", values);
        setIsLoading(true);
        try {
            const response = await resetPassword(values);
            console.log("Reset password response:", response);
            toast({
                title: "Password reset successful",
                description: "Your password has been updated successfully.",
            });
            // Navigate back to login or show success message
            window.location.href = "/affiliate/login";
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to reset password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case "email":
                return (
                    <>
                        <CardHeader className="p-0 mb-4 text-center">
                            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your email address to receive a password reset code
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="m@example.com"
                                                        type="email"
                                                        {...field}
                                                        className="rounded-md border-border px-3 py-2"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button 
                                        type="submit" 
                                        className="w-full rounded-md font-semibold" 
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending..." : "Send Reset Code"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                );

            case "verify":
                return (
                    <>
                        <CardHeader className="p-0 mb-4 text-center">
                            <CardTitle className="text-2xl font-bold">Verify Code</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter the 6-digit code sent to {email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                                    {/* Hidden email field - required by schema but not shown to user */}
                                    <FormField
                                        control={otpForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <input type="hidden" {...field} />
                                        )}
                                    />
                                    <FormField
                                        control={otpForm.control}
                                        name="otp_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>OTP Code</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="123456"
                                                        type="text"
                                                        maxLength={6}
                                                        value={field.value}
                                                        onChange={(e) => handleOTPChange(e.target.value, field.onChange)}
                                                        className="rounded-md border-border px-3 py-2 text-center text-lg tracking-widest"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="flex-1 rounded-md font-semibold"
                                            onClick={() => setStep("email")}
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="flex-1 rounded-md font-semibold" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Verifying..." : "Verify Code"}
                                        </Button>
                                    </div>
                                    <div className="text-center">
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-sm text-muted-foreground underline"
                                            onClick={handleResendOTP}
                                            disabled={isLoading}
                                        >
                                            Didn't receive the code? Resend
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                );

            case "reset":
                return (
                    <>
                        <CardHeader className="p-0 mb-4 text-center">
                            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Enter your new password
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Form {...passwordForm} key={`password-form-${verificationToken}`}>
                                <form onSubmit={passwordForm.handleSubmit(handleResetPassword, (errors) => {
                                    console.log("Form validation errors:", errors);
                                })} className="space-y-4">
                                    {/* Hidden verification token field */}
                                    <FormField
                                        control={passwordForm.control}
                                        name="verification_token"
                                        render={({ field }) => (
                                            <input type="hidden" {...field} />
                                        )}
                                    />
                                    <FormField
                                        control={passwordForm.control}
                                        name="new_password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Enter new password"
                                                            type={showPassword ? "text" : "password"}
                                                            {...field}
                                                            className="rounded-md border-border px-3 py-2 pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="flex-1 rounded-md font-semibold"
                                            onClick={() => {
                                                passwordForm.reset();
                                                setStep("verify");
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="flex-1 rounded-md font-semibold" 
                                            disabled={isLoading}
                                            onClick={() => {
                                                console.log("Reset password button clicked");
                                                console.log("Form values:", passwordForm.getValues());
                                                console.log("Form errors:", passwordForm.formState.errors);
                                            }}
                                        >
                                            {isLoading ? "Resetting..." : "Reset Password"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="affiliate-theme flex items-center justify-center min-h-screen bg-background">
            <Card className="mx-auto max-w-sm rounded-lg p-6 shadow-sm border-border">
                {renderStep()}
                <div className="mt-6 text-center text-sm">
                    Remember your password?{" "}
                    <Link to="/affiliate/login" className="underline text-primary">
                        Back to Login
                    </Link>
                </div>
            </Card>
        </div>
    );
};
