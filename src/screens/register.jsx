// import React, { useState , useContext } from 'react';
// import { Eye, EyeOff, Code, Zap, Users, ArrowRight, Check, X } from 'lucide-react';
// import CollabraLogo from '../components/logo';
// import { Link , useNavigate } from 'react-router-dom';
// import axios from '../config/axios';
// import { UserContext } from '../context/user.context';

// const SignUp = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false,
//     subscribeNewsletter: false
//   });

//   const [passwordStrength, setPasswordStrength] = useState({
//     hasLength: false,
//     hasUpper: false,
//     hasLower: false,
//     hasNumber: false,
//     hasSpecial: false
//   });


//   const navigate = useNavigate();
//   const { setUser } = useContext(UserContext);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     // Simulate signup process
//     const email = formData.email;
//     const password = formData.password;

//     axios.post('/users/register' , {
//         email,
//         password
//     }).then((res)=>{
//         console.log(res.data);

//         localStorage.setItem('token' , res.data.token)
//         setUser(res.data.user);


//         navigate('/')
//     }).catch((err)=>{
//         console.log(err.response.data);
//     })

//     setTimeout(() => {
//       setIsLoading(false);
//       console.log('Signup attempted with:', formData);
//     }, 2000);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });

//     // Password strength checker
//     if (name === 'password') {
//       setPasswordStrength({
//         hasLength: value.length >= 8,
//         hasUpper: /[A-Z]/.test(value),
//         hasLower: /[a-z]/.test(value),
//         hasNumber: /\d/.test(value),
//         hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
//       });
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     const score = Object.values(passwordStrength).filter(Boolean).length;
//     if (score < 2) return 'bg-red-500';
//     if (score < 4) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const getPasswordStrengthText = () => {
//     const score = Object.values(passwordStrength).filter(Boolean).length;
//     if (score < 2) return 'Weak';
//     if (score < 4) return 'Medium';
//     return 'Strong';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//       </div>

//       {/* Grid pattern overlay */}
//       <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>

//       <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
//         {/* Left side - Branding and Features */}
//         <div className="hidden lg:block space-y-8 px-8">
//           <div className="space-y-6">
//             <CollabraLogo size="lg" />
            
//             <h2 className="text-4xl font-bold text-white leading-tight">
//               Join the Future of<br />
//               <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                 Collaborative Coding
//               </span>
//             </h2>
            
//             <p className="text-slate-300 text-lg leading-relaxed">
//               Start your journey with AI-powered development tools. Create, collaborate, and ship faster than ever before.
//             </p>
//           </div>

//           {/* Features */}
//           <div className="space-y-4">
//             <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
//               <div className="p-2 bg-cyan-500/20 rounded-lg">
//                 <Zap className="w-5 h-5 text-cyan-400" />
//               </div>
//               <div>
//                 <h3 className="text-white font-semibold">AI Code Assistant</h3>
//                 <p className="text-slate-400 text-sm">Get intelligent code suggestions and debugging help</p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
//               <div className="p-2 bg-blue-500/20 rounded-lg">
//                 <Users className="w-5 h-5 text-blue-400" />
//               </div>
//               <div>
//                 <h3 className="text-white font-semibold">Team Collaboration</h3>
//                 <p className="text-slate-400 text-sm">Work together seamlessly with your team</p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
//               <div className="p-2 bg-green-500/20 rounded-lg">
//                 <Code className="w-5 h-5 text-green-400" />
//               </div>
//               <div>
//                 <h3 className="text-white font-semibold">Multi-Language Support</h3>
//                 <p className="text-slate-400 text-sm">Code in Python, JavaScript, Java, and more</p>
//               </div>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">10K+</div>
//               <div className="text-slate-400 text-sm">Developers</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">50K+</div>
//               <div className="text-slate-400 text-sm">Projects</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-white">99.9%</div>
//               <div className="text-slate-400 text-sm">Uptime</div>
//             </div>
//           </div>
//         </div>

//         {/* Right side - Sign Up Form */}
//         <div className="w-full max-w-md mx-auto lg:max-w-lg">
//           <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            
//             {/* Mobile branding */}
//             <div className="lg:hidden text-center mb-8">
//               <div className="flex justify-center mb-4">
//                 <CollabraLogo size="md" />
//               </div>
//               <p className="text-slate-300">Join the future of collaborative coding</p>
//             </div>

//             <div className="hidden lg:block mb-8">
//               <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
//               <p className="text-slate-300">Start coding with AI assistance today</p>
//             </div>

//             <div className="space-y-6">
//               {/* Name Fields */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <div className="text-sm font-medium text-slate-300">
//                     First Name
//                   </div>
//                   <input
//                     type="text"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                     placeholder="John"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <div className="text-sm font-medium text-slate-300">
//                     Last Name
//                   </div>
//                   <input
//                     type="text"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                     placeholder="Doe"
//                   />
//                 </div>
//               </div>

//               {/* Email Field */}
//               <div className="space-y-2">
//                 <div className="text-sm font-medium text-slate-300">
//                   Email Address
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
//                   placeholder="john@example.com"
//                 />
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <div className="text-sm font-medium text-slate-300">
//                   Password
//                 </div>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12"
//                     placeholder="Create a strong password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
                
//                 {/* Password Strength */}
//                 {formData.password && (
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-slate-400">Password Strength</span>
//                       <span className={`text-xs font-medium ${
//                         getPasswordStrengthColor() === 'bg-red-500' ? 'text-red-400' :
//                         getPasswordStrengthColor() === 'bg-yellow-500' ? 'text-yellow-400' : 'text-green-400'
//                       }`}>
//                         {getPasswordStrengthText()}
//                       </span>
//                     </div>
//                     <div className="w-full bg-white/10 rounded-full h-2">
//                       <div 
//                         className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
//                         style={{ width: `${(Object.values(passwordStrength).filter(Boolean).length / 5) * 100}%` }}
//                       ></div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-2 text-xs">
//                       <div className={`flex items-center space-x-1 ${passwordStrength.hasLength ? 'text-green-400' : 'text-slate-400'}`}>
//                         {passwordStrength.hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                         <span>8+ characters</span>
//                       </div>
//                       <div className={`flex items-center space-x-1 ${passwordStrength.hasUpper ? 'text-green-400' : 'text-slate-400'}`}>
//                         {passwordStrength.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                         <span>Uppercase</span>
//                       </div>
//                       <div className={`flex items-center space-x-1 ${passwordStrength.hasLower ? 'text-green-400' : 'text-slate-400'}`}>
//                         {passwordStrength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                         <span>Lowercase</span>
//                       </div>
//                       <div className={`flex items-center space-x-1 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-slate-400'}`}>
//                         {passwordStrength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                         <span>Number</span>
//                       </div>
//                       <div className={`flex items-center space-x-1 ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-slate-400'} col-span-2`}>
//                         {passwordStrength.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
//                         <span>Special character</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Confirm Password Field */}
//               <div className="space-y-2">
//                 <div className="text-sm font-medium text-slate-300">
//                   Confirm Password
//                 </div>
//                 <div className="relative">
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12 ${
//                       formData.confirmPassword && formData.password !== formData.confirmPassword 
//                         ? 'border-red-500' : 'border-white/20'
//                     }`}
//                     placeholder="Confirm your password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
//                   >
//                     {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {formData.confirmPassword && formData.password !== formData.confirmPassword && (
//                   <p className="text-red-400 text-xs">Passwords do not match</p>
//                 )}
//               </div>

//               {/* Checkboxes */}
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <input
//                     type="checkbox"
//                     name="agreeToTerms"
//                     checked={formData.agreeToTerms}
//                     onChange={handleInputChange}
//                     className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500 mt-0.5"
//                   />
//                   <div className="text-sm text-slate-300">
//                     I agree to the{' '}
//                     <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
//                       Terms of Service
//                     </button>{' '}
//                     and{' '}
//                     <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
//                       Privacy Policy
//                     </button>
//                   </div>
//                 </div>
//                 <div className="flex items-start space-x-3">
//                   <input
//                     type="checkbox"
//                     name="subscribeNewsletter"
//                     checked={formData.subscribeNewsletter}
//                     onChange={handleInputChange}
//                     className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500 mt-0.5"
//                   />
//                   <div className="text-sm text-slate-300">
//                     Send me updates about new features and coding tips
//                   </div>
//                 </div>
//               </div>

//               {/* Sign Up Button */}
//               <button
//                 onClick={handleSubmit}
//                 disabled={isLoading || !formData.agreeToTerms || formData.password !== formData.confirmPassword}
//                 className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
//               >
//                 {isLoading ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 ) : (
//                   <>
//                     <span>Create Account</span>
//                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   </>
//                 )}
//               </button>

//               {/* Divider */}
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-white/20"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-slate-900/50 text-slate-400">Or sign up with</span>
//                 </div>
//               </div>

//               {/* Social Sign Up */}
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   type="button"
//                   className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
//                 >
//                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                     <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                     <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                     <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                     <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                   </svg>
//                   Google
//                 </button>
//                 <button
//                   type="button"
//                   className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
//                   </svg>
//                   GitHub
//                 </button>
//               </div>

//               {/* Sign In Link */}
//               <div className="text-center text-sm text-slate-300">
//                 Already have an account?{' '}
//                 <Link className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium" to="/login">
//                   Sign in
//                 </Link> 
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;




import React, { useState, useContext, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Code, Zap, Users, ArrowRight, Check, X } from 'lucide-react';
import CollabraLogo from '../components/logo';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Memoized password strength calculation
  const passwordStrengthScore = useMemo(() => {
    return Object.values(passwordStrength).filter(Boolean).length;
  }, [passwordStrength]);

  const passwordStrengthColor = useMemo(() => {
    if (passwordStrengthScore < 2) return 'bg-red-500';
    if (passwordStrengthScore < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [passwordStrengthScore]);

  const passwordStrengthText = useMemo(() => {
    if (passwordStrengthScore < 2) return 'Weak';
    if (passwordStrengthScore < 5) return 'Medium';
    return 'Strong';
  }, [passwordStrengthScore]);

  // Optimized password strength checker
  const checkPasswordStrength = useCallback((password) => {
    setPasswordStrength({
      hasLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrengthScore < 5) {
      newErrors.password = 'Password is too weak';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordStrengthScore]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      
      const response = await axios.post('/users/register', {
        name: fullName,
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender
      });

      console.log('Registration successful:', response.data);

      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      // Handle specific error messages
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, setUser, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Password strength checker
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  }, [errors, checkPasswordStrength]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const genderOptions = useMemo(() => [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'others', label: 'Others' }
  ], []);

  const isFormValid = useMemo(() => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.email.trim() && 
           formData.password && 
           formData.confirmPassword && 
           formData.gender &&
           formData.agreeToTerms && 
           formData.password === formData.confirmPassword &&
           passwordStrengthScore >= 3;
  }, [formData, passwordStrengthScore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left side - Branding and Features */}
        <div className="hidden lg:block space-y-8 px-8">
          <div className="space-y-6">
            <CollabraLogo size="lg" />
            
            <h2 className="text-4xl font-bold text-white leading-tight">
              Join the Future of<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Collaborative Coding
              </span>
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed">
              Start your journey with AI-powered development tools. Create, collaborate, and ship faster than ever before.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Code Assistant</h3>
                <p className="text-slate-400 text-sm">Get intelligent code suggestions and debugging help</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Team Collaboration</h3>
                <p className="text-slate-400 text-sm">Work together seamlessly with your team</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Code className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Multi-Language Support</h3>
                <p className="text-slate-400 text-sm">Code in Python, JavaScript, Java, and more</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-slate-400 text-sm">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-slate-400 text-sm">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
            
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <CollabraLogo size="md" />
              </div>
              <p className="text-slate-300">Join the future of collaborative coding</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-slate-300">Start coding with AI assistance today</p>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                      errors.firstName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="John"
                    required
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                      errors.lastName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Doe"
                    required
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="john@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                    errors.gender ? 'border-red-500' : 'border-white/20'
                  }`}
                  required
                >
                  <option value="" className="bg-slate-800 text-slate-300">Select your gender</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-xs">{errors.gender}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12 ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password}</p>
                )}
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrengthColor === 'bg-red-500' ? 'text-red-400' :
                        passwordStrengthColor === 'bg-yellow-500' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {passwordStrengthText}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthColor}`}
                        style={{ width: `${(passwordStrengthScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasLength ? 'text-green-400' : 'text-slate-400'}`}>
                        {passwordStrength.hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>6+ characters</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasUpper ? 'text-green-400' : 'text-slate-400'}`}>
                        {passwordStrength.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasLower ? 'text-green-400' : 'text-slate-400'}`}>
                        {passwordStrength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-slate-400'}`}>
                        {passwordStrength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-slate-400'} col-span-2`}>
                        {passwordStrength.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm pr-12 ${
                      errors.confirmPassword || (formData.confirmPassword && formData.password !== formData.confirmPassword) 
                        ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-red-400 text-xs">Passwords do not match</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500 mt-0.5"
                    required
                  />
                  <div className="text-sm text-slate-300">
                    I agree to the{' '}
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      Privacy Policy
                    </button>
                  </div>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-400 text-xs ml-7">{errors.agreeToTerms}</p>
                )}
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500 mt-0.5"
                  />
                  <div className="text-sm text-slate-300">
                    Send me updates about new features and coding tips
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/50 text-slate-400">Or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center text-sm text-slate-300">
                Already have an account?{' '}
                <Link className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium" to="/login">
                  Sign in
                </Link> 
              </div>
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default SignUp;