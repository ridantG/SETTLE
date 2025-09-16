"use client";

import React, { useState, useEffect } from 'react';
import { type User } from "@supabase/supabase-js";
import { FaBirthdayCake, FaBriefcase, FaUniversity, FaUser, FaUtensils, FaDog } from "react-icons/fa";
import ImageUpload from "@/components/ImageUpload";
import MultiImageUpload from "@/components/MultiImageUpload";
import toast from "react-hot-toast";
import { type Profile, type OnboardingFormProps } from '@/lib/schemas';

const TOTAL_STEPS = 3;

export default function OnboardingForm({ user, profileData, onSave, isSaving }: OnboardingFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    const [formData, setFormData] = useState<Profile>({
        ...profileData,
        age: profileData.age ?? null
    });

    useEffect(() => {
        setFormData({
            ...profileData,
            age: profileData.age ?? null
        });
    }, [profileData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleHabitChange = (habit: keyof Profile, value: boolean) => {
        setFormData(prev => ({ ...prev, [habit]: value }));
    };

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSummarize = async () => {
        if (!formData.description || formData.description.trim().length < 50) {
            return toast.error("Please write at least 50 characters.");
        }
        setIsSummarizing(true);
        // ... (AI summary logic)
        setIsSummarizing(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const profileToSave: Profile = {
            ...formData,
            age: formData.age ? Number(formData.age) : null
        };
        onSave(profileToSave);
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={isSaving || isSummarizing}>
                <div className="mb-8">
                  <div className="overflow-hidden h-2 rounded bg-green-200">
                    <div style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }} className="h-full bg-green-500 transition-all duration-500"></div>
                  </div>
                </div>
                
                {/* Step 1: Basics */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Step 1: Basics</h2>
                        <div className="relative">
                            <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input type="text" id="name" value={formData.name || ""} onChange={handleChange} required className="w-full pl-12 p-3 bg-gray-100 rounded"/>
                        </div>
                        <div className="relative">
                            <FaBirthdayCake className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input type="number" id="age" value={formData.age ?? ""} onChange={handleChange} required className="w-full pl-12 p-3 bg-gray-100 rounded"/>
                        </div>
                        <div>
                            <label>Your Photograph</label>
                            <ImageUpload user={user} bucket="avatars" initialImageUrl={formData.image_url} onUploadSuccess={(url) => setFormData(p => ({...p, image_url: url}))} />
                        </div>
                    </div>
                )}
                
                {/* Step 2: Lifestyle */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Step 2: Lifestyle</h2>
                        <div className="relative">
                          <FaBriefcase className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                          <select id="status" value={formData.status || ""} onChange={handleChange} required className="w-full pl-12 p-3 bg-gray-100 rounded appearance-none">
                            <option value="" disabled>Select Status</option>
                            <option value="Student">Student</option>
                            <option value="Professional">Professional</option>
                          </select>
                        </div>
                        {formData.status && (
                          <div className="relative">
                            <FaUniversity className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input type="text" id="organization" value={formData.organization || ""} onChange={handleChange} placeholder={formData.status === "Student" ? "Institute" : "Company"} required className="w-full pl-12 p-3 bg-gray-100 rounded"/>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-6 pt-2">
                            {/* Drinks */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Drinks?</label>
                              <div className="flex gap-3">
                                <button type="button" onClick={() => handleHabitChange("drinks", true)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.drinks ? "bg-green-500 text-white" : "bg-gray-200"}`}>Yes</button>
                                <button type="button" onClick={() => handleHabitChange("drinks", false)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.drinks === false ? "bg-red-500 text-white" : "bg-gray-200"}`}>No</button>
                              </div>
                            </div>
                            {/* Smokes */}
                            <div>
                              <label className="block text-sm font-medium mb-2">Smokes?</label>
                              <div className="flex gap-3">
                                <button type="button" onClick={() => handleHabitChange("smokes", true)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.smokes ? "bg-green-500 text-white" : "bg-gray-200"}`}>Yes</button>
                                <button type="button" onClick={() => handleHabitChange("smokes", false)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.smokes === false ? "bg-red-500 text-white" : "bg-gray-200"}`}>No</button>
                              </div>
                            </div>
                        </div>
                        <div className="relative">
                          <FaUtensils className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                          <select id="diet" value={formData.diet || ""} onChange={handleChange} required className="w-full pl-12 p-3 bg-gray-100 rounded appearance-none">
                            <option value="" disabled>Diet</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Flexible">Flexible</option>
                          </select>
                        </div>
                        <div>
                          <label className=" text-sm font-medium mb-2 flex items-center gap-2"><FaDog /> Do you have pets?</label>
                          <div className="flex gap-3">
                            <button type="button" onClick={() => handleHabitChange("has_pets", true)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.has_pets ? "bg-green-500 text-white" : "bg-gray-200"}`}>Yes</button>
                            <button type="button" onClick={() => handleHabitChange("has_pets", false)} className={`w-full py-2 rounded-lg text-sm font-semibold ${formData.has_pets === false ? "bg-red-500 text-white" : "bg-gray-200"}`}>No</button>
                          </div>
                        </div>
                    </div>
                )}
                
                {/* Step 3: About */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Step 3: About You</h2>
                        <textarea id="description" rows={5} value={formData.description || ""} onChange={handleChange} className="w-full p-3 bg-gray-100 rounded"/>
                        <div><button type="button" onClick={handleSummarize} disabled={isSummarizing}>Summarize with AI</button></div>
                        {formData.role === 'lister' && (
                          <div>
                            <label>Flat Photos</label>
                            <MultiImageUpload user={user} bucket="flat-photos" initialImageUrls={formData.flat_image_urls || []} onUploadSuccess={(urls) => setFormData(p => ({...p, flat_image_urls: urls}))} />
                          </div>
                        )}
                    </div>
                )}
                
                <div className="pt-8 mt-8 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
                    <button type="button" onClick={prevStep} className={`font-bold py-3 px-6 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}>Back</button>
                    {currentStep < TOTAL_STEPS ? (
                      <button type="button" onClick={nextStep} className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">Next Step</button>
                    ) : (
                      <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 disabled:opacity-50 transition-colors">
                        {isSaving ? "Saving..." : "Finish & Save Profile"}
                      </button>
                    )}
                </div>
            </fieldset>
        </form>
    );
}
