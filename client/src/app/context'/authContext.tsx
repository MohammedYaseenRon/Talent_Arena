"use client";

import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

type Role = "USER" | "RECRUITER";

type User = {
    id: string,
    email: string
    role: Role,
    name?: string | null;
}


type RegisterInput = {
    name: string,
    email: string,
    password: string
}


type RecruiterRegisterInput = {
    name: string,
    email: string,
    password: string
    companyName: string,
    desigNation: string,
    companyWebsite: string
}

type AuthContextValue = {
    user: User | null;
    loading: boolean,
    login: (email: string, password: string) => Promise<User>,
    register: (input: RegisterInput) => Promise<User>;
    recruiterRegister: (input: RecruiterRegisterInput) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);


    const fetchMe = async () => {
        try {
            const res = await axios.get(`${API_BASE}/auth/me`, {
                withCredentials: true,
            });
            setUser(res.data.user ?? null);
        }catch(error) {
            console.log("Error while fetching", error);
        }finally{
            setLoading(false);
        }
    }

    const login = async (email: string, password: string) => {
        try {
        const res = await axios.post(
            `${API_BASE}/auth/login`,
            {email, password},
            { withCredentials: true },
        );
        setUser(res.data?.user ?? null);
        return res.data?.user;
        } catch (error: any) {
        const message =
            error?.response?.data?.error || "Login failed";
        throw new Error(message);
        }
    };
    const register = async (input: RegisterInput) => {
        try {
        const res = await axios.post(
            `${API_BASE}/auth/register`,
            input,
            { withCredentials: true },
        );
        setUser(res.data?.user ?? null);
        return res.data?.user;
        } catch (error: any) {
        const message =
            error?.response?.data?.error || "Registration failed";
        throw new Error(message);
        }
    };
    const recruiterRegister = async (input: RecruiterRegisterInput) => {
        try {
        const res = await axios.post(
            `${API_BASE}/auth/recruiter/register`,
            input,
            { withCredentials: true },
        );
        setUser(res.data?.user ?? null);
        return res.data?.user;
        } catch (error: any) {
        const message =
            error?.response?.data?.error || "Registration failed";
        throw new Error(message);
        }
    };

    const logout = async () => {
        try {
        await axios.post(
            `${API_BASE}/auth/logout`,
            {},
            { withCredentials: true },
        );
        } finally {
        setUser(null);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const value: AuthContextValue = {
        user, loading, login, logout, register, recruiterRegister, refresh: fetchMe
    }


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
