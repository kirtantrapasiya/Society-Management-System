import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { User, Users } from "lucide-react"; 

export default function LoginChooseUserType() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
        {/* Content */}
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
                    <p className="text-gray-600">Please select your login type</p>
                </div>
                <div className="flex flex-col mb-6 gap-4">
                    <button 
                    className="border rounded-md p-2 bg-teal-600 text-white flex flex-row gap-2 justify-center intem-center hover:bg-teal-700"    
                    onClick={() => navigate('/visitor-login')}
                    >
                        Visitor Login
                    </button>
                    <button 
                    className="border rounded-md p-2 bg-cyan-700 text-white flex flex-row gap-2 justify-center intem-center hover:bg-cyan-800"
                    onClick={() => navigate('/resident-login')}
                    >
                        Resident Login
                    </button>
                </div>
                <div className="space-y-4">
                    <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 mx-auto text-gray-500 hover:text-gray-700 text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to home
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}