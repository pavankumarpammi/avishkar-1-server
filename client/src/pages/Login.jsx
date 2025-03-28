import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  
  const [signupInput, setSignupInput] = useState({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    role: "USER",
    secureCode: ""
  });
  const [loginInput, setLoginInput] = useState({ 
    identifier: "",
    password: "" 
  });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: ""
  });
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [showSecureCode, setShowSecureCode] = useState(false);
  const [secureCodeError, setSecureCodeError] = useState("");

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const navigate = useNavigate();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+?91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    if (phone.startsWith('+')) return phone;
    
    if (phone.startsWith('91') && phone.length > 2) {
      return '+' + phone;
    }
    
    return '+91' + phone;
  };

  const isPhoneNumber = (input) => {
    return /^[0-9+]+$/.test(input);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: "", color: "" };
    }

    let score = 0;
    let message = "";
    let color = "bg-gray-200";

    if (password.length >= 8) score += 1;
    
    if (/[A-Z]/.test(password)) score += 1;
    
    if (/[a-z]/.test(password)) score += 1;
    
    if (/[0-9]/.test(password)) score += 1;
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 8) {
      message = "Password must be at least 8 characters";
      color = "bg-red-500";
    } else if (score <= 2) {
      message = "Weak";
      color = "bg-red-500";
    } else if (score === 3) {
      message = "Medium";
      color = "bg-yellow-500";
    } else if (score === 4) {
      message = "Strong";
      color = "bg-green-500";
    } else {
      message = "Very Strong";
      color = "bg-green-700";
    }

    return { score, message, color };
  };

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      
      if (name === "password") {
        setPasswordStrength(calculatePasswordStrength(value));
      }
      
      if (name === "role") {
        setShowSecureCode(value === "INSTRUCTOR");
        setSecureCodeError("");
      }
    } else {
      setLoginInput({ ...loginInput, [name]: value });
      
      if (name === "identifier") {
        setIsPhoneLogin(isPhoneNumber(value));
      }
    }
  };

  const handleRegistration = async (type) => {
    try {
      let hasErrors = false;
      if (type === "signup") {
        const { name, phone_number, email, password, role, secureCode } = signupInput;
        
        if (!validatePhoneNumber(phone_number)) {
          setPhoneError("Please enter a valid 10-digit Indian phone number");
          hasErrors = true;
        } else {
          setPhoneError("");
        }
        
        if (!validateEmail(email)) {
          setEmailError("Please enter a valid email address");
          hasErrors = true;
        } else {
          setEmailError("");
        }
        
        if (!name || !phone_number || !email || !password) {
          toast.error("Please fill in all required fields");
          hasErrors = true;
        }

        // Check secure code for instructor role
        if (role === "INSTRUCTOR") {
          if (!secureCode) {
            setSecureCodeError("Secure code is required for instructor registration");
            hasErrors = true;
          } else {
            // Hash the secure code using SHA-256
            const encoder = new TextEncoder();
            const data = encoder.encode(secureCode);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashedSecureCodeHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // The correct hash for "07082003"
            const correctHash = "e19178ceca0780f1e63a921b8828110591f61f675ca996c8710d05906ab38ee8";
            
            console.log('Entered code:', secureCode); // Debug log
            console.log('Entered code hash:', hashedSecureCodeHex); // Debug log
            console.log('Expected hash:', correctHash); // Debug log
            
            if (hashedSecureCodeHex !== correctHash) {
              setSecureCodeError("Invalid secure code");
              hasErrors = true;
            } else {
              setSecureCodeError("");
            }
          }
        }
        
        if (hasErrors) return;
        
        const formattedInput = {
          ...signupInput,
          phone_number: formatPhoneNumber(phone_number)
        };
        
        const response = await registerUser(formattedInput);
        
        if (response.error) {
          if (response.error.status === 403) {
            navigate("/verify-phone", { state: { userId: response.error.data.userId } });
          } else {
            toast.error(response.error.data?.message || "Signup failed");
          }
          return;
        }
        
        if (response.data?.success) {
          navigate("/verify-phone", { state: { userId: response.data.userId } });
        }
        
      } else {
        const { identifier, password } = loginInput;
        
        if (!identifier || !password) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        let payload = { password };
        
        if (isPhoneLogin) {
          if (!validatePhoneNumber(identifier)) {
            setPhoneError("Please enter a valid 10-digit Indian phone number");
            return;
          } else {
            setPhoneError("");
          }
          
          payload.phone_number = formatPhoneNumber(identifier);
        } else {
          if (!validateEmail(identifier)) {
            setEmailError("Please enter a valid email address");
            return;
          } else {
            setEmailError("");
          }
          
          payload.email = identifier;
        }
        
        const response = await loginUser(payload);
        
        if (response.error) {
          toast.error(response.error.data?.message || "Login failed");
          return;
        }
        
        if (response.data?.success) {
          toast.success(response.data.message || "Login successful");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData?.message) {
      toast.success(registerData.message);
    }
    if (registerError?.data) {
      toast.error(registerError.data.message || "Signup Failed");
    }
    if (loginIsSuccess && loginData?.message) {
      toast.success(loginData.message);
      navigate("/");
    }
    if (loginError?.data && loginError.status !== 403) {
      toast.error(loginError.data?.message || "Login Failed");
    }
  }, [
    loginData,
    registerData,
    loginError,
    registerError,
    navigate,
    loginIsSuccess,
    registerIsSuccess
  ]);

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue={defaultTab} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="Enter your phone number"
                  value={signupInput.phone_number}
                  onChange={(e) => changeInputHandler(e, "signup")}
                />
                {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {passwordStrength.message && (
                  <div className="flex items-center gap-2">
                    <div className={`h-1 w-16 ${passwordStrength.color} rounded-full`} />
                    <p className="text-sm text-gray-500">{passwordStrength.message}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={signupInput.role}
                  onChange={(e) => changeInputHandler(e, "signup")}
                >
                  <option value="USER">User</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>
              {showSecureCode && (
                <div className="space-y-2">
                  <Label htmlFor="secureCode">Secure Code</Label>
                  <Input
                    id="secureCode"
                    name="secureCode"
                    type="password"
                    placeholder="Enter secure code for instructor registration"
                    value={signupInput.secureCode}
                    onChange={(e) => changeInputHandler(e, "signup")}
                  />
                  {secureCodeError && <p className="text-sm text-red-500">{secureCodeError}</p>}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email or phone and password to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  type="text"
                  name="identifier"
                  value={loginInput.identifier}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder={isPhoneLogin ? "9XXXXXXXXX" : "your@email.com"}
                  required={true}
                />
                {(phoneError || emailError) && (
                  <p className="text-red-500 text-sm">{isPhoneLogin ? phoneError : emailError}</p>
                )}
                <p className="text-xs text-gray-500">
                  {isPhoneLogin 
                    ? "Enter your 10-digit number without country code. +91 will be added automatically." 
                    : "Enter the email address you registered with."}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="Enter your password"
                    required={true}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;