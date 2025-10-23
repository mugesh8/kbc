import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Calendar, Upload, ArrowLeft, ArrowRight, Plus, Check, LogIn, Eye, EyeOff, XCircle, MapPin } from 'lucide-react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import baseurl from '../Baseurl/baseurl';

// Move all sub-components outside of the main component
const TopHeader = React.memo(({ navigate }) => (
  <div className="w-full bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 mb-6">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
            <img
              src="/image.png"
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              KBC
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:block text-gray-600 text-sm">
            Already have an account?
          </span>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 bg-white border-2 border-green-500 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        </div>
      </div>
    </div>
  </div>
));

const StepIndicator = React.memo(({ currentStep, steps, handleStepChange }) => (
  <div className="flex items-center justify-between mb-8 px-4 lg:px-8">
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 2)) * 100}%` }}
          />
        </div>
        {steps.slice(0, -1).map((step, index) => (
          <div key={step.number} className="flex flex-col items-center relative z-10">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer hover:scale-105 ${step.active
                ? currentStep > step.number
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-green-500 text-white shadow-lg ring-4 ring-green-100'
                : 'bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              onClick={() => step.active && handleStepChange(step.number)}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5 animate-in fade-in duration-300" />
              ) : (
                <span className="animate-in fade-in duration-300">{step.number}</span>
              )}
            </div>
            <div className={`text-xs mt-2 text-center font-medium transition-colors duration-300 hidden sm:block ${step.active ? 'text-green-600' : 'text-gray-400'
              }`}>
              {step.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

const InputField = React.memo(({ label, name, placeholder, required = false, type = 'text', icon = null, className = '', value, onChange, error }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = `input-${name}`;
  return (
    <div className={`mb-4 group ${className}`}>
      <label htmlFor={inputId} className="block text-gray-800 text-sm font-semibold mb-2 transition-colors duration-200 group-focus-within:text-green-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          autoComplete="off"
          spellCheck={false}
          className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm ${error ? 'border-red-500' : 'border-gray-200'}`}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors duration-200">
            {icon}
          </div>
        )}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(prev => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const SelectField = React.memo(({ label, name, placeholder, required = false, options = [], value, onChange, className = '', error }) => {
  const selectId = `select-${name}`;
  return (
    <div className={`mb-4 group ${className}`}>
      <label htmlFor={selectId} className="block text-gray-800 text-sm font-semibold mb-2 transition-colors duration-200 group-focus-within:text-green-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none bg-gray-50 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm transition-all duration-200 ${error ? 'border-red-500' : 'border-gray-200'}`}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>{option.label || option}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none group-focus-within:text-green-500 transition-colors duration-200" />
      </div>
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const TagsInput = React.memo(({ label = 'Tags', placeholder = 'Type to add tags', tags = [], onAdd, onRemove, suggestions = [], error }) => {
  const [inputValue, setInputValue] = useState('');
  const filteredSuggestions = suggestions
    .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
    .filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase()))
    .slice(0, 8);

  const handleAdd = (tag) => {
    if (!tag) return;
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.find(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd && onAdd(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' ) {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onRemove && onRemove(tags.length - 1);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-800 text-sm font-semibold mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className={`w-full p-3 border rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 ${error ? 'border-red-500' : 'border-gray-200'}`}>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
              {tag}
              <button type="button" className="text-green-700 hover:text-green-900" onClick={() => onRemove && onRemove(idx)} aria-label={`Remove ${tag}`}>×</button>
            </span>
          ))}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-w-[180px] bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
      {filteredSuggestions.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-sm p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredSuggestions.map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => handleAdd(s)}
              className="text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-700 text-sm border border-gray-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const FileUpload = React.memo(({ label, name, acceptedFormats, multiple = false, onChange, className = '', error, value, onRemove }) => {
  const inputId = `file-${name}`;
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={inputId} className="block text-gray-800 text-sm font-semibold mb-2">{label}</label>
      <label htmlFor={inputId} className={`border-2 border-dashed rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300 cursor-pointer group block ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300" />
        <p className="text-gray-600 mb-1 group-hover:text-green-600 transition-colors duration-300">
          Upload {multiple ? 'Media' : 'Image'}
        </p>
        <p className="text-sm text-gray-400">Accepted formats: {acceptedFormats}</p>
        <input
          id={inputId}
          type="file"
          name={name}
          accept={acceptedFormats}
          multiple={multiple}
          onChange={onChange}
          className="hidden"
        />
      </label>
      {/* Previews */}
      {(!multiple && value) && (
        <div className="mt-4 relative inline-block">
          {value.type && value.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(value)}
              alt="preview"
              className="h-24 w-24 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center border text-xs text-gray-600 px-2 break-all">
              {value.name || 'Selected file'}
            </div>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove()}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
              aria-label="Remove file"
            >
              ×
            </button>
          )}
        </div>
      )}
      {(multiple && Array.isArray(value) && value.length > 0) && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {value.map((file, idx) => (
            <div key={idx} className="relative">
              {file.type && file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`media-${idx}`}
                  className="h-20 w-20 object-cover rounded-lg border"
                />
              ) : file.type && file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="h-20 w-20 object-cover rounded-lg border"
                  muted
                />
              ) : (
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center border text-[10px] text-gray-600 p-1 text-center break-all">
                  {file.name || 'File'}
                </div>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                  aria-label="Remove file"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const ActionButtons = React.memo(({ showBack = true, backLabel = 'Back', nextLabel = 'Continue', onNext, onBack }) => (
  <div className="flex flex-col sm:flex-row gap-4 mt-8">
    {showBack && (
      <button
        type="button"
        onClick={onBack}
        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center font-medium hover:shadow-md transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="mr-2 w-5 h-5" /> {backLabel}
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      {nextLabel} <ArrowRight className="ml-2 w-5 h-5" />
    </button>
  </div>
));

const StepContainer = React.memo(({ children }) => (
  <>{children}</>
));

// Simplified Branch Location Component with only essential fields
const BranchLocation = React.memo(({ 
  branch, 
  index, 
  profileIndex, 
  onUpdate, 
  onRemove,
  validationErrors 
}) => {
  const handleChange = (field, value) => {
    onUpdate(profileIndex, index, field, value);
  };

  const handleNumericChange = (field, value) => {
    const digitsOnly = value.replace(/\D+/g, '');
    onUpdate(profileIndex, index, field, digitsOnly);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white relative mb-6">
      {index > 0 && (
        <button
          type="button"
          onClick={() => onRemove(profileIndex, index)}
          className="absolute top-4 right-4 text-red-500 hover:text-red-600"
          aria-label="Remove branch"
        >
          <XCircle className="w-6 h-6" />
        </button>
      )}
      
      <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-green-600" />
        Branch {index + 1} {index === 0 && <span className="text-sm text-gray-500 ml-2">(Main Branch)</span>}
      </h4>

      <div className="space-y-6">
        {/* Branch Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InputField
            label="Branch Name"
            placeholder="e.g., Head Office, Downtown Branch"
            required
            value={branch.branch_name || ''}
            onChange={(e) => handleChange('branch_name', e.target.value)}
            error={validationErrors[`branch_name_${profileIndex}_${index}`]}
          />
          <InputField
            label="Contact Number"
            placeholder="Enter branch contact number"
            required
            value={branch.business_work_contract || ''}
            onChange={(e) => handleNumericChange('business_work_contract', e.target.value)}
            error={validationErrors[`business_work_contract_${profileIndex}_${index}`]}
          />
        </div>

        <InputField
          label="Email"
          placeholder="Enter branch email"
          type="email"
          required
          value={branch.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={validationErrors[`email_${profileIndex}_${index}`]}
        />

        {/* Branch Address */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-bold">
            Complete Address <span className="text-red-500">*</span>
          </label>
          <TextareaAutosize
            minRows={3}
            placeholder="Enter complete branch address"
            required
            value={branch.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none ${
              validationErrors[`address_${profileIndex}_${index}`] ? 'border-red-500' : 'border-gray-200'
            }`}
            style={{ resize: "vertical" }}
          />
          {validationErrors[`address_${profileIndex}_${index}`] && (
            <p className="mt-1 text-red-500 text-sm">{validationErrors[`address_${profileIndex}_${index}`]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="City"
            placeholder="Enter city"
            required
            value={branch.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            error={validationErrors[`city_${profileIndex}_${index}`]}
          />
          <InputField
            label="State"
            placeholder="Enter state"
            required
            value={branch.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            error={validationErrors[`state_${profileIndex}_${index}`]}
          />
          <InputField
            label="Pincode"
            placeholder="Enter pincode"
            required
            value={branch.zip_code || ''}
            onChange={(e) => handleNumericChange('zip_code', e.target.value)}
            error={validationErrors[`zip_code_${profileIndex}_${index}`]}
          />
        </div>
      </div>
    </div>
  );
});

const PersonalInformation = React.memo(({ formData, validationErrors, createInputChangeHandler, createNumericInputChangeHandler, handleInputChange, nextStep, onRemoveProfileImage }) => (
  <StepContainer>
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-909 mb-2">Personal Information</h2>
        <p className="text-gray-600">Please provide your personal details</p>
      </div>
      <div className="space-y-8 text-left">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Personal Information
          </h3>
          <InputField
            label="Full Name"
            name="first_name"
            placeholder="Enter your full name"
            required
            value={formData.first_name || ''}
            onChange={createInputChangeHandler('first_name')}
            error={validationErrors.first_name}
          />
          <InputField
            label="Phone Number"
            name="contact_no"
            placeholder="Enter phone number"
            required
            value={formData.contact_no || ''}
            onChange={createNumericInputChangeHandler('contact_no')}
            error={validationErrors.contact_no}
          />
          <InputField
            label="Email"
            name="email"
            placeholder="Enter your email address"
            required
            value={formData.email || ''}
            onChange={createInputChangeHandler('email')}
            error={validationErrors.email}
          />
          <InputField
            label="Password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
            value={formData.password || ''}
            onChange={createInputChangeHandler('password')}
            error={validationErrors.password}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="Date of Birth"
              name="dob"
              placeholder="dd-mm-yyyy"
              type="date"
              required
              value={formData.dob || ''}
              onChange={createInputChangeHandler('dob')}
              error={validationErrors.dob}
            />
            <SelectField
              label="Gender"
              name="gender"
              placeholder="Select gender"
              options={['Male', 'Female', 'Other']}
              required
              value={formData.gender}
              onChange={createInputChangeHandler('gender')}
              error={validationErrors.gender}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SelectField
              label="Marital Status"
              name="marital_status"
              placeholder="Select marital status"
              options={['Single', 'Married', 'Divorced', 'Widowed']}
              value={formData.marital_status}
              onChange={createInputChangeHandler('marital_status')}
            />
          </div>
          <FileUpload
            label="Profile Image"
            name="profile_image"
            acceptedFormats="image/*"
            onChange={handleInputChange}
            value={formData.profile_image}
            onRemove={onRemoveProfileImage}
          />
        </div>
      </div>
      <ActionButtons showBack={false} nextLabel="Continue" onNext={nextStep} />
    </div>
  </StepContainer>
));

const AddressDetails = React.memo(({ formData, validationErrors, createInputChangeHandler, createNumericInputChangeHandler, handleInputChange, nextStep, prevStep }) => (
  <StepContainer>
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-909 mb-2">Address & Contact Details</h2>
        <p className="text-gray-600">Please provide your address and referral information</p>
      </div>
      <div className="space-y-8 text-left">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            Address Information
          </h3>
          <InputField
            label="Address"
            name="address"
            placeholder="Enter your complete address"
            required
            value={formData.address || ''}
            onChange={createInputChangeHandler('address')}
            error={validationErrors.address}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="City"
              name="city"
              placeholder="Enter city"
              required
              value={formData.city || ''}
              onChange={createInputChangeHandler('city')}
              error={validationErrors.city}
            />
            <InputField
              label="State"
              name="state"
              placeholder="Enter state"
              required
              value={formData.state || ''}
              onChange={createInputChangeHandler('state')}
              error={validationErrors.state}
            />
          </div>
          <InputField
            label="Pincode"
            name="zip_code"
            placeholder="Enter pincode"
            required
            value={formData.zip_code || ''}
            onChange={createNumericInputChangeHandler('zip_code')}
            error={validationErrors.zip_code}
          />
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Referral Information
          </h3>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="has_referral"
              checked={formData.has_referral}
              onChange={handleInputChange}
              className="w-4 h-4 text-green-600 rounded mr-3 focus:ring-2 focus:ring-green-500"
            />
            <label className="text-gray-700 font-medium">Do You Have Referral</label>
          </div>
          {formData.has_referral && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InputField
                label="Referral Person Name"
                name="referral_name"
                placeholder="Enter referral person name"
                value={formData.referral_name || ''}
                onChange={createInputChangeHandler('referral_name')}
              />
              <InputField
                label="Referral Code"
                name="referral_code"
                placeholder="Enter referral code"
                value={formData.referral_code || ''}
                onChange={createInputChangeHandler('referral_code')}
                error={validationErrors.referral_code}
              />
            </div>
          )}
        </div>
      </div>
      <ActionButtons onNext={nextStep} onBack={prevStep} />
    </div>
  </StepContainer>
));

const BusinessProfile = React.memo(({ 
  formData, 
  validationErrors, 
  createBusinessInputChangeHandler, 
  createBusinessNumericInputChangeHandler,
  handleBusinessProfileChange, 
  handleBusinessFileUpload, 
  addBusinessProfile, 
  nextStep, 
  prevStep,
  onRemoveBusinessProfileImage,
  onRemoveBusinessMedia,
  onRemoveBusinessProfile,
  categoriesOptions,
  handleCategoryInputChange,
  handleSelectExistingCategory,
  handleTagAdd,
  handleTagRemove,
  // New handlers for branches
  handleAddBranch,
  handleUpdateBranch,
  handleRemoveBranch
}) => (
  <StepContainer>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h2>
        <p className="text-gray-600">Please provide your business information and branch locations</p>
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).filter(key => 
        key.startsWith('business_type_') || 
        key.startsWith('branch_') || 
        key.startsWith('company_name_') ||
        key.startsWith('about_') ||
        key.startsWith('business_email_') ||
        key.startsWith('business_address_') ||
        key.includes('_0_') || 
        key.includes('_1_') ||
        key.includes('_2_')
      ).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors before continuing:</h3>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {Object.entries(validationErrors)
              .filter(([key]) => 
                key.startsWith('business_type_') || 
                key.startsWith('branch_') || 
                key.startsWith('company_name_') ||
                key.startsWith('about_') ||
                key.startsWith('business_email_') ||
                key.startsWith('business_address_') ||
                key.includes('_0_') || 
                key.includes('_1_') ||
                key.includes('_2_')
              )
              .map(([key, error]) => (
                <li key={key}>{error}</li>
              ))
            }
          </ul>
        </div>
      )}

      <div className="space-y-8">
        {formData.businessProfiles.map((profile, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-2xl border border-gray-200 shadow-sm relative"
          >
            <h3 className="text-xl font-semibold text-green-700 mb-6 flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {index + 1}
              </div>
              Business Profile {index + 1}
            </h3>
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemoveBusinessProfile && onRemoveBusinessProfile(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                aria-label="Remove business profile"
                title="Remove this business profile"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
            <div className="space-y-6 text-left">
              {/* Basic Business Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Business Information</h4>
                <SelectField
                  label="Business Type"
                  placeholder="Select business type"
                  options={[
                    { value: 'self-employed', label: 'Self Employed' },
                    { value: 'business', label: 'Business' },
                    { value: 'salary', label: 'Salary' }
                  ]}
                  value={profile.business_type}
                  onChange={(e) => handleBusinessProfileChange(index, 'business_type', e.target.value)}
                  required
                  error={validationErrors[`business_type_${index}`]}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InputField
                    label="Company Name"
                    placeholder="Enter company name"
                    required
                    value={profile.company_name}
                    onChange={createBusinessInputChangeHandler(index, 'company_name')}
                    error={validationErrors[`company_name_${index}`]}
                  />
                  <div className="mb-4 relative">
                    <label className="block text-gray-800 text-sm font-semibold mb-2">Category</label>
                    <input
                      type="text"
                      value={profile.category_input || ''}
                      onChange={(e) => handleCategoryInputChange(index, e.target.value)}
                      placeholder="Type to search or add category"
                      className="w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm"
                    />
                    {(categoriesOptions || []).length > 0 && (profile.category_input || '').length > 0 && profile.show_category_suggestions && (
                      <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                        {(categoriesOptions || [])
                          .filter(c => c.category_name.toLowerCase().includes((profile.category_input||'').toLowerCase()))
                          .slice(0, 8)
                          .map(c => (
                            <button
                              type="button"
                              key={c.cid}
                              className="w-full text-left px-4 py-2 hover:bg-green-50"
                              onClick={() => handleSelectExistingCategory(index, c.cid, c.category_name)}
                            >
                              {c.category_name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>





                {/* Business Type Specific Fields */}
                {profile.business_type === "salary" && (
                  <>
                    <InputField
                      label="Designation"
                      placeholder="Enter designation"
                      required
                      value={profile.designation}
                      onChange={createBusinessInputChangeHandler(index, 'designation')}
                      error={validationErrors[`designation_${index}`]}
                    />
                    <InputField
                      label="Salary"
                      placeholder="Enter salary"
                      required
                      value={profile.salary}
                      onChange={createBusinessInputChangeHandler(index, 'salary')}
                      error={validationErrors[`salary_${index}`]}
                    />
                    <InputField
                      label="Experience"
                      placeholder="Enter experience in years"
                      required
                      value={profile.experience}
                      onChange={createBusinessInputChangeHandler(index, 'experience')}
                      error={validationErrors[`experience_${index}`]}
                    />
                  </>
                )}

                {(profile.business_type === "self-employed" || profile.business_type === "business") && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SelectField
                        label="Business Registration Type"
                        placeholder="Select business registration type"
                        options={['Proprietor', 'Partnership', 'Private Limited', 'Others']}
                        value={profile.business_registration_type}
                        onChange={(e) => handleBusinessProfileChange(index, 'business_registration_type', e.target.value)}
                        required
                      />
                      {profile.business_registration_type === 'Others' && (
                        <InputField
                          label="Specify Business Registration Type"
                          placeholder="Enter registration type"
                          value={profile.business_registration_type_other || ''}
                          onChange={createBusinessInputChangeHandler(index, 'business_registration_type_other')}
                        />
                      )}
                      {profile.business_type === 'self-employed' && (
                        <InputField
                          label="Work Experience (years)"
                          placeholder="Enter years of experience"
                          type="number"
                          value={profile.experience || ''}
                          onChange={createBusinessNumericInputChangeHandler(index, 'experience')}
                          error={validationErrors[`experience_${index}`]}
                        />
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-sm font-bold">
                        About Business <span className="text-red-500">*</span>
                      </label>
                      <TextareaAutosize
                        minRows={4}
                        placeholder="Tell us about your business, services, products, and what makes you unique..."
                        required
                        value={profile.about}
                        onChange={createBusinessInputChangeHandler(index, 'about')}
                        className={`w-full p-3 border rounded-lg focus:ring focus:ring-green-300 focus:outline-none ${
                          validationErrors[`about_${index}`] ? 'border-red-500' : 'border-gray-200'
                        }`}
                        style={{ resize: "vertical" }}
                      />
                      {validationErrors[`about_${index}`] && (
                        <p className="mt-1 text-red-500 text-sm">{validationErrors[`about_${index}`]}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Branch Locations Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Branch Locations
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({profile.branches ? profile.branches.length : 1} branch{profile.branches && profile.branches.length !== 1 ? 'es' : ''})
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddBranch(index)}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Branch</span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {profile.branches && profile.branches.map((branch, branchIndex) => (
                    <BranchLocation
                      key={branchIndex}
                      branch={branch}
                      index={branchIndex}
                      profileIndex={index}
                      onUpdate={handleUpdateBranch}
                      onRemove={handleRemoveBranch}
                      validationErrors={validationErrors}
                    />
                  ))}
                </div>

                {(!profile.branches || profile.branches.length === 0) && (
                  <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No branches added yet</p>
                    <p className="text-sm mb-4">Add your first branch location to get started</p>
                    <button
                      type="button"
                      onClick={() => handleAddBranch(index)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      Add First Branch
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <TagsInput
                  label="Business Tags"
                  placeholder="Add tags to describe your business (e.g., restaurant, delivery, luxury, affordable)"
                  tags={profile.tags || []}
                  onAdd={(tag) => handleTagAdd && handleTagAdd(index, tag)}
                  onRemove={(tagIndex) => handleTagRemove && handleTagRemove(index, tagIndex)}
                />
              </div>

              {/* File Uploads */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Media</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FileUpload
                    label="Business Logo/Profile Image"
                    name={`business_profile_image_${index}`}
                    acceptedFormats="image/*"
                    onChange={(e) => handleBusinessFileUpload(index, 'business_profile_image', e.target.files[0])}
                    value={profile.business_profile_image}
                    onRemove={() => onRemoveBusinessProfileImage(index)}
                  />
                  <FileUpload
                    label={`Media Gallery (${profile.media_gallery.length}/10)`}
                    name={`media_gallery_${index}`}
                    acceptedFormats="image/*,video/*"
                    multiple
                    onChange={(e) => handleBusinessFileUpload(index, 'media_gallery', e.target.files)}
                    value={profile.media_gallery}
                    onRemove={(mediaIndex) => onRemoveBusinessMedia(index, mediaIndex)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addBusinessProfile}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Plus className="mr-2 w-5 h-5" /> Add Another Business Profile
        </button>
      </div>
      <ActionButtons onNext={nextStep} onBack={prevStep} />
    </div>
  </StepContainer>
));

// Fixed Autocomplete field for family member names with phone autofill
const NameAutocompleteField = React.memo(({ 
  label, 
  nameValue, 
  contactValue, 
  onNameChange, 
  onContactChange, 
  suggestionsSource,
  error 
}) => {
  const [localQuery, setLocalQuery] = useState(nameValue || '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalQuery(nameValue || '');
  }, [nameValue]);

  const filtered = (suggestionsSource || [])
    .filter(s => {
      const nameMatch = (s.name || '').toLowerCase().includes((localQuery || '').toLowerCase());
      const phoneMatch = (s.phone || '').includes((localQuery || ''));
      return nameMatch || phoneMatch;
    })
    .slice(0, 8);

  const handleSelect = (item) => {
    // Update both name and contact fields when a suggestion is selected
    if (onNameChange) onNameChange(item.name || '');
    if (onContactChange) onContactChange(item.phone || '');
    setLocalQuery(item.name || '');
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (onNameChange) onNameChange(value);
    setIsOpen(true);
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-gray-800 text-sm font-semibold mb-2">{label}</label>
      <input
        value={localQuery}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm ${error ? 'border-red-500' : 'border-gray-200'}`}
      />
      {isOpen && localQuery && filtered.length > 0 && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
          {filtered.map((item, idx) => (
            <button
              type="button"
              key={idx}
              className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center justify-between"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              onClick={() => handleSelect(item)}
            >
              <span className="text-gray-800">{item.name}</span>
              <span className="text-gray-500 text-sm">{item.phone}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
});

const FamilyDetails = React.memo(({ 
  formData, 
  createInputChangeHandler, 
  createNumericInputChangeHandler, 
  handleInputChange, 
  nextStep, 
  loading, 
  error, 
  memberSuggestions, 
  onFillFamily, 
  validationErrors 
}) => {
  
  // Handler for name field changes
  const handleNameChange = (role, field, value) => {
    onFillFamily(role, { [field]: value });
  };

  return (
    <StepContainer>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Family Details</h2>
          <p className="text-gray-600">Please provide your family information</p>
        </div>
        <div className="space-y-4 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NameAutocompleteField
              label="Father Name"
              nameValue={formData.father_name}
              contactValue={formData.father_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => handleNameChange('father', 'name', val)}
              onContactChange={(val) => handleNameChange('father', 'phone', val)}
            />
            <InputField
              label="Father Contact"
              name="father_contact"
              placeholder="Enter father's contact number"
              value={formData.father_contact}
              onChange={createNumericInputChangeHandler('father_contact')}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <NameAutocompleteField
              label="Mother Name"
              nameValue={formData.mother_name}
              contactValue={formData.mother_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => handleNameChange('mother', 'name', val)}
              onContactChange={(val) => handleNameChange('mother', 'phone', val)}
            />
            <InputField
              label="Mother Contact"
              name="mother_contact"
              placeholder="Enter mother's contact number"
              value={formData.mother_contact}
              onChange={createNumericInputChangeHandler('mother_contact')}
            />
          </div>
          {/* Show spouse fields only for Married and Widowed */}
          {formData.marital_status && (formData.marital_status === 'Married' || formData.marital_status === 'Widowed') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NameAutocompleteField
                label="Spouse Name"
                nameValue={formData.spouse_name}
                contactValue={formData.spouse_contact}
                suggestionsSource={memberSuggestions}
                onNameChange={(val) => handleNameChange('spouse', 'name', val)}
                onContactChange={(val) => handleNameChange('spouse', 'phone', val)}
              />
              <InputField
                label="Spouse Contact"
                name="spouse_contact"
                placeholder="Enter spouse's contact number"
                value={formData.spouse_contact}
                onChange={createNumericInputChangeHandler('spouse_contact')}
              />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="Family Address"
              name="family_address"
              placeholder="Enter family address"
              value={formData.family_address}
              onChange={createInputChangeHandler('family_address')}
            />
            {/* Show children fields only for Married and Widowed */}
            {formData.marital_status && (formData.marital_status === 'Married' || formData.marital_status === 'Widowed') && (
              <InputField
                label="Number of Children"
                name="number_of_children"
                placeholder="Enter number of children"
                value={formData.number_of_children}
                onChange={createInputChangeHandler('number_of_children')}
              />
            )}
          </div>
          {/* Show children names only for Married and Widowed */}
          {formData.marital_status && (formData.marital_status === 'Married' || formData.marital_status === 'Widowed') && (
            <div className="mb-6">
              <label className="block text-gray-800 text-sm font-semibold mb-2">Children Names</label>
              <textarea
                placeholder="Enter children names (separated by comma)"
                rows={4}
                name="children_names"
                value={formData.children_names}
                onChange={createInputChangeHandler('children_names')}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 resize-none bg-gray-50 placeholder-gray-400 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm"
              />
            </div>
          )}
          
          {/* Terms and Conditions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="accepted_terms"
                checked={!!formData.accepted_terms}
                onChange={handleInputChange}
                className={`mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 ${validationErrors.accepted_terms ? 'ring-2 ring-red-500' : ''}`}
              />
              <span className="text-sm text-gray-700">
                I agree to the
                {' '}<Link to="/terms?embed=1" className="text-green-700 underline hover:text-green-800">Terms & Conditions</Link>
                {' '}and consent to my information being used by KBC for the business directory.
              </span>
            </label>
            {validationErrors.accepted_terms && (
              <p className="mt-2 text-red-500 text-sm ml-7">{validationErrors.accepted_terms}</p>
            )}
          </div>
        </div>
        
        <button
          type="button"
          onClick={nextStep}
          className="w-full mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </StepContainer>
  );
});

const CompleteStep = React.memo(({ navigate }) => (
  <StepContainer>
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-600">Your account has been successfully created.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4"
        >
          Go to Login
        </button>
      </div>
    </div>
  </StepContainer>
));

const SignupForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [memberSuggestions, setMemberSuggestions] = useState([]);

  // Form state - Updated with new business fields
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    genderOther: '',
    contact_no: '',
    marital_status: '',
    kootam: '',
    kootamOther: '',
    kovil: '',
    kovilOther: '',
    profile_image: null,
    accepted_terms: false,
    // Address Information
    address: '',
    city: '',
    state: '',
    zip_code: '',
    // Referral Information
    has_referral: false,
    referral_name: '',
    referral_code: '',
    // Business Profiles - Updated with new business contact and address fields
    businessProfiles: [{
      business_type: '',
      category_id: '',
      show_category_suggestions: false,
      company_name: '',
      business_registration_type: '',
      business_registration_type_other: '',
      about: '',
      // NEW BUSINESS CONTACT FIELDS
      business_email: '',
      business_work_contact: '',
      // NEW BUSINESS ADDRESS FIELDS
      business_address: '',
      business_city: '',
      business_state: '',
      business_zip_code: '',
      // Existing fields
      business_starting_year: '',
      designation: '',
      salary: '',
      location: '',
      experience: '',
      business_profile_image: null,
      media_gallery: [],
      tags: [],
      // Simplified branches array with only essential fields
      branches: [{
        branch_name: 'Main Branch',
        business_work_contract: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
      }]
    }],
    // Family Details
    father_name: '',
    father_contact: '',
    mother_name: '',
    mother_contact: '',
    spouse_name: '',
    spouse_contact: '',
    number_of_children: '',
    children_names: '',
    family_address: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseurl}/api/category/all`);
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch family entries for autocomplete suggestions
  useEffect(() => {
    const fetchMembersForSuggestions = async () => {
      try {
        const res = await fetch(`${baseurl}/api/member-family/all`);
        if (!res.ok) return;
        const data = await res.json();
        const families = data.data || [];
        const uniq = new Map();
        families.forEach(f => {
          const candidates = [
            { name: (f.father_name || '').trim(), phone: (f.father_contact || '').trim() },
            { name: (f.mother_name || '').trim(), phone: (f.mother_contact || '').trim() },
            { name: (f.spouse_name || '').trim(), phone: (f.spouse_contact || '').trim() },
          ];
          candidates.forEach(c => {
            if (c.name) {
              const key = `${c.name}|${c.phone}`;
              if (!uniq.has(key)) uniq.set(key, c);
            }
          });
        });
        setMemberSuggestions(Array.from(uniq.values()));
      } catch (e) {
        // silent fail for suggestions
      }
    };
    fetchMembersForSuggestions();
  }, []);

  const steps = [
    { number: 1, name: 'Personal', active: currentStep >= 1 },
    { number: 2, name: 'Address', active: currentStep >= 2 },
    { number: 3, name: 'Business', active: currentStep >= 3 },
    { number: 4, name: 'Family', active: currentStep >= 4 },
    { number: 5, name: 'Complete', active: currentStep >= 5 }
  ];

  // Animation handler
  const handleStepChange = (newStep, dir = 'forward') => {
    if (newStep === currentStep) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentStep(newStep);
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 150);
  };

  // Simplified handlers for branch management
  const handleAddBranch = useCallback((profileIndex) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const newBranch = {
        branch_name: `Branch ${(updatedProfiles[profileIndex].branches?.length || 0) + 1}`,
        business_work_contract: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
      };
      
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        branches: [...(updatedProfiles[profileIndex].branches || []), newBranch]
      };
      
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  const handleUpdateBranch = useCallback((profileIndex, branchIndex, field, value) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const updatedBranches = [...(updatedProfiles[profileIndex].branches || [])];
      
      updatedBranches[branchIndex] = {
        ...updatedBranches[branchIndex],
        [field]: value
      };

      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        branches: updatedBranches
      };
      
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  const handleRemoveBranch = useCallback((profileIndex, branchIndex) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const updatedBranches = [...(updatedProfiles[profileIndex].branches || [])];
      
      // Don't remove the first branch
      if (branchIndex === 0) return prev;
      
      updatedBranches.splice(branchIndex, 1);
      
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        branches: updatedBranches
      };
      
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  // FIXED VALIDATION FUNCTION - Added validation for new business fields
  const validateStep = (step) => {
    const errors = {};
    console.log(`Validating step ${step}`, formData);

    if (step === 1) {
      if (!formData.first_name?.trim()) errors.first_name = "Full name is required";
      if (!formData.email?.trim()) errors.email = "Email is required";
      if (!formData.password?.trim()) errors.password = "Password is required";
      if (!formData.contact_no?.trim()) errors.contact_no = "Contact number is required";
      if (!formData.dob?.trim()) errors.dob = "Date of birth is required";
      if (!formData.gender?.trim()) errors.gender = "Gender is required";
    }

    if (step === 2) {
      if (!formData.address?.trim()) errors.address = "Address is required";
      if (!formData.city?.trim()) errors.city = "City is required";
      if (!formData.state?.trim()) errors.state = "State is required";
      if (!formData.zip_code?.trim()) errors.zip_code = "Pincode is required";
      if (formData.has_referral) {
        const code = (formData.referral_code || '').trim();
        if (!code) errors.referral_code = "Referral code is required";
      }
    }

    if (step === 3) {
      console.log('Validating business profiles:', formData.businessProfiles);
      
      formData.businessProfiles.forEach((profile, index) => {
        // Basic business type validation
        if (!profile.business_type?.trim()) {
          errors[`business_type_${index}`] = "Business type is required";
        }

        // Validate main business contact information
        // if (!profile.business_email?.trim()) {
        //   errors[`business_email_${index}`] = "Business email is required";
        // }
        // if (!profile.business_work_contact?.trim()) {
        //   errors[`business_work_contact_${index}`] = "Business work contact is required";
        // }
        // if (!profile.business_address?.trim()) {
        //   errors[`business_address_${index}`] = "Business address is required";
        // }
        // if (!profile.business_city?.trim()) {
        //   errors[`business_city_${index}`] = "Business city is required";
        // }
        // if (!profile.business_state?.trim()) {
        //   errors[`business_state_${index}`] = "Business state is required";
        // }
        // if (!profile.business_zip_code?.trim()) {
        //   errors[`business_zip_code_${index}`] = "Business pincode is required";
        // }

        // Validate branches for ALL business types
        if (profile.branches && profile.branches.length > 0) {
          profile.branches.forEach((branch, branchIndex) => {
            if (!branch.branch_name?.trim()) {
              errors[`branch_name_${index}_${branchIndex}`] = "Branch name is required";
            }
            if (!branch.business_work_contract?.trim()) {
              errors[`business_work_contract_${index}_${branchIndex}`] = "Branch contact number is required";
            }
            if (!branch.email?.trim()) {
              errors[`email_${index}_${branchIndex}`] = "Branch email is required";
            }
            if (!branch.address?.trim()) {
              errors[`address_${index}_${branchIndex}`] = "Branch address is required";
            }
            if (!branch.city?.trim()) {
              errors[`city_${index}_${branchIndex}`] = "Branch city is required";
            }
            if (!branch.state?.trim()) {
              errors[`state_${index}_${branchIndex}`] = "Branch state is required";
            }
            if (!branch.zip_code?.trim()) {
              errors[`zip_code_${index}_${branchIndex}`] = "Branch pincode is required";
            }
          });
        } else {
          errors[`branches_${index}`] = "At least one branch is required";
        }

        // Business type specific validations
        if (profile.business_type === "salary") {
          if (!profile.company_name?.trim()) {
            errors[`company_name_${index}`] = "Company name is required";
          }
          if (!profile.designation?.trim()) {
            errors[`designation_${index}`] = "Designation is required";
          }
          if (!profile.salary?.trim()) {
            errors[`salary_${index}`] = "Salary is required";
          }
          if (!profile.experience?.trim()) {
            errors[`experience_${index}`] = "Experience is required";
          }
        }

        if (profile.business_type === "self-employed" || profile.business_type === "business") {
          if (!profile.company_name?.trim()) {
            errors[`company_name_${index}`] = "Company name is required";
          }
          if (!profile.about?.trim()) {
            errors[`about_${index}`] = "About business is required";
          }
        }
      });
    }

    if (step === 4) {
      if (!formData.accepted_terms) errors.accepted_terms = "You must accept the Terms & Conditions";
    }

    console.log(`Step ${step} validation errors:`, errors);
    setValidationErrors(errors);
    
    const isValid = Object.keys(errors).length === 0;
    console.log(`Step ${step} is valid:`, isValid);
    
    return isValid;
  };

  const validateAllSteps = () => {
    const errors = {};

    // Validate step 1 - Personal Information
    if (!formData.first_name?.trim()) errors.first_name = "Full name is required";
    if (!formData.email?.trim()) errors.email = "Email is required";
    if (!formData.password?.trim()) errors.password = "Password is required";
    if (!formData.contact_no?.trim()) errors.contact_no = "Contact number is required";
    if (!formData.dob?.trim()) errors.dob = "Date of birth is required";
    if (!formData.gender?.trim()) errors.gender = "Gender is required";

    // Validate step 2 - Address Information
    if (!formData.address?.trim()) errors.address = "Address is required";
    if (!formData.city?.trim()) errors.city = "City is required";
    if (!formData.state?.trim()) errors.state = "State is required";
    if (!formData.zip_code?.trim()) errors.zip_code = "Pincode is required";
    if (formData.has_referral) {
      const code = (formData.referral_code || '').trim();
      if (!code) errors.referral_code = "Referral code is required";
    }

    // Validate step 3 - Business Profiles
    formData.businessProfiles.forEach((profile, index) => {
      if (!profile.business_type?.trim()) errors[`business_type_${index}`] = "Business type is required";

      // Validate main business fields
      // if (!profile.business_email?.trim()) errors[`business_email_${index}`] = "Business email is required";
      // if (!profile.business_work_contact?.trim()) errors[`business_work_contact_${index}`] = "Business work contact is required";
      // if (!profile.business_address?.trim()) errors[`business_address_${index}`] = "Business address is required";
      // if (!profile.business_city?.trim()) errors[`business_city_${index}`] = "Business city is required";
      // if (!profile.business_state?.trim()) errors[`business_state_${index}`] = "Business state is required";
      // if (!profile.business_zip_code?.trim()) errors[`business_zip_code_${index}`] = "Business pincode is required";

      // Validate branches
      if (profile.branches && profile.branches.length > 0) {
        profile.branches.forEach((branch, branchIndex) => {
          if (!branch.branch_name?.trim()) errors[`branch_name_${index}_${branchIndex}`] = "Branch name is required";
          if (!branch.business_work_contract?.trim()) errors[`business_work_contract_${index}_${branchIndex}`] = "Branch contact number is required";
          if (!branch.email?.trim()) errors[`email_${index}_${branchIndex}`] = "Branch email is required";
          if (!branch.address?.trim()) errors[`address_${index}_${branchIndex}`] = "Branch address is required";
          if (!branch.city?.trim()) errors[`city_${index}_${branchIndex}`] = "Branch city is required";
          if (!branch.state?.trim()) errors[`state_${index}_${branchIndex}`] = "Branch state is required";
          if (!branch.zip_code?.trim()) errors[`zip_code_${index}_${branchIndex}`] = "Branch pincode is required";
        });
      } else {
        errors[`branches_${index}`] = "At least one branch is required";
      }

      if (profile.business_type === "salary") {
        if (!profile.company_name?.trim()) errors[`company_name_${index}`] = "Company name is required";
        if (!profile.designation?.trim()) errors[`designation_${index}`] = "Designation is required";
        if (!profile.salary?.trim()) errors[`salary_${index}`] = "Salary is required";
        if (!profile.experience?.trim()) errors[`experience_${index}`] = "Experience is required";
      }

      if (profile.business_type === "self-employed" || profile.business_type === "business") {
        if (!profile.company_name?.trim()) errors[`company_name_${index}`] = "Company name is required";
        if (!profile.about?.trim()) errors[`about_${index}`] = "About business is required";
      }
    });

    // Validate step 4 - Family Details
    if (!formData.accepted_terms) errors.accepted_terms = "You must accept the Terms & Conditions";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // FIXED NEXT STEP FUNCTION
  const nextStep = () => {
    console.log('Next step clicked, current step:', currentStep);
    
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to step:', currentStep + 1);
      if (currentStep < 4) {
        handleStepChange(currentStep + 1, 'forward');
      } else if (currentStep === 4) {
        handleSubmit();
      }
    } else {
      console.log('Validation failed, showing errors');
      // Scroll to top to show validation errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1, 'backward');
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  // Memoized input change handlers to prevent re-renders
  const createInputChangeHandler = useCallback((fieldName) => {
    return (e) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: e.target.value
      }));
    };
  }, []);

  // Digit-only input handler for phone/pincode/numeric fields
  const createNumericInputChangeHandler = useCallback((fieldName) => {
    return (e) => {
      const digitsOnly = (e.target.value || '').replace(/\D+/g, '');
      setFormData(prev => ({
        ...prev,
        [fieldName]: digitsOnly
      }));
    };
  }, []);

  const createBusinessInputChangeHandler = useCallback((index, field) => {
    return (e) => {
      setFormData(prev => {
        const updatedProfiles = [...prev.businessProfiles];
        updatedProfiles[index][field] = e.target.value;
        return {
          ...prev,
          businessProfiles: updatedProfiles
        };
      });
    };
  }, []);

  const handleCategoryInputChange = useCallback((index, value) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      updatedProfiles[index].category_input = value;
      updatedProfiles[index].show_category_suggestions = true;
      // If user is typing a new value, clear stale category_id until selection/creation
      if (!value || value.trim() === '' || (updatedProfiles[index].category_id && value.trim().toLowerCase() !== (categories.find(c => String(c.cid) === String(updatedProfiles[index].category_id))?.category_name || '').toLowerCase())) {
        updatedProfiles[index].category_id = '';
      }
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, [categories]);

  const handleSelectExistingCategory = useCallback((index, cid, name) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      updatedProfiles[index].category_id = String(cid);
      updatedProfiles[index].category_input = name;
      updatedProfiles[index].show_category_suggestions = false;
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  // Tag handlers
  const handleTagAdd = useCallback((index, tag) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const currentTags = Array.isArray(updatedProfiles[index].tags) ? updatedProfiles[index].tags : [];
      updatedProfiles[index].tags = [...currentTags, tag];
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  const handleTagRemove = useCallback((index, tagIndex) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const currentTags = Array.isArray(updatedProfiles[index].tags) ? updatedProfiles[index].tags : [];
      updatedProfiles[index].tags = currentTags.filter((_, idx) => idx !== tagIndex);
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  // Digit-only variant for business profile fields
  const createBusinessNumericInputChangeHandler = useCallback((index, field) => {
    return (e) => {
      const digitsOnly = (e.target.value || '').replace(/\D+/g, '');
      setFormData(prev => {
        const updatedProfiles = [...prev.businessProfiles];
        updatedProfiles[index][field] = digitsOnly;
        return {
          ...prev,
          businessProfiles: updatedProfiles
        };
      });
    };
  }, []);

  const handleBusinessProfileChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      updatedProfiles[index][field] = value;
      return {
        ...prev,
        businessProfiles: updatedProfiles
      };
    });
  }, []);

  // UPDATED addBusinessProfile function to include new fields
  const addBusinessProfile = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      businessProfiles: [
        ...prev.businessProfiles,
        {
          business_type: '',
          category_id: '',
          show_category_suggestions: false,
          company_name: '',
          business_registration_type: '',
          business_registration_type_other: '',
          about: '',
          // NEW BUSINESS CONTACT FIELDS
          business_email: '',
          business_work_contact: '',
          // NEW BUSINESS ADDRESS FIELDS
          business_address: '',
          business_city: '',
          business_state: '',
          business_zip_code: '',
          // Existing fields
          business_starting_year: '',
          designation: '',
          salary: '',
          location: '',
          experience: '',
          business_profile_image: null,
          media_gallery: [],
          tags: [],
          branches: [{
            branch_name: 'Main Branch',
            business_work_contract: '',
            email: '',
            address: '',
            city: '',
            state: '',
            zip_code: ''
          }]
        }
      ]
    }));
  }, []);

  const removeBusinessProfile = useCallback((index) => {
    setFormData(prev => {
      const updated = [...prev.businessProfiles];
      if (index <= 0 || index >= updated.length) return prev; // don't remove first or out of range
      updated.splice(index, 1);
      return { ...prev, businessProfiles: updated };
    });
  }, []);

  const handleBusinessFileUpload = useCallback((index, field, file) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];

      if (field === 'media_gallery') {
        // Handle multiple files for media gallery
        const filesArray = Array.from(file);
        updatedProfiles[index][field] = [...updatedProfiles[index][field], ...filesArray];
      } else {
        updatedProfiles[index][field] = file;
      }

      return {
        ...prev,
        businessProfiles: updatedProfiles
      };
    });
  }, []);

  // Remove handlers for previews
  const handleRemoveProfileImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      profile_image: null
    }));
  }, []);

  const handleRemoveBusinessProfileImage = useCallback((index) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      updatedProfiles[index] = {
        ...updatedProfiles[index],
        business_profile_image: null
      };
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  const handleRemoveBusinessMedia = useCallback((profileIndex, mediaIndex) => {
    setFormData(prev => {
      const updatedProfiles = [...prev.businessProfiles];
      const currentMedia = updatedProfiles[profileIndex].media_gallery || [];
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        media_gallery: currentMedia.filter((_, idx) => idx !== mediaIndex)
      };
      return { ...prev, businessProfiles: updatedProfiles };
    });
  }, []);

  // Fixed autofill handler for family fields from suggestions
  const handleFillFamilyFromSuggestion = useCallback((role, updates) => {
    setFormData(prev => ({
      ...prev,
      ...(updates.name !== undefined && { [`${role}_name`]: updates.name }),
      ...(updates.phone !== undefined && { [`${role}_contact`]: (String(updates.phone || '').replace(/\D+/g, '')) })
    }));
  }, []);

  // UPDATED handleSubmit function to include new business fields
  const handleSubmit = async () => {
    // Validate all steps before submission
    if (!validateAllSteps()) {
      console.log('Final validation failed, not submitting');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Append personal information
      submitData.append('first_name', formData.first_name || '');
      submitData.append('email', formData.email || '');
      submitData.append('password', formData.password || '');
      submitData.append('dob', formData.dob || '');
      submitData.append('gender', formData.gender || '');
      submitData.append('genderOther', formData.genderOther || '');
      submitData.append('contact_no', formData.contact_no || '');
      submitData.append('marital_status', formData.marital_status || '');
      submitData.append('kootam', formData.kootam || '');
      submitData.append('kootamOther', formData.kootamOther || '');
      submitData.append('kovil', formData.kovil || '');
      submitData.append('kovilOther', formData.kovilOther || '');
      if (formData.profile_image) {
        submitData.append('profile_image', formData.profile_image);
      }

      // Append address information
      submitData.append('address', formData.address || '');
      submitData.append('city', formData.city || '');
      submitData.append('state', formData.state || '');
      submitData.append('zip_code', formData.zip_code || '');

      // Append referral information - convert boolean to string and normalize code
      submitData.append('has_referral', formData.has_referral ? 'true' : 'false');
      if (formData.has_referral) {
        submitData.append('referral_name', (formData.referral_name || '').trim());
        const normalizedReferralCode = (formData.referral_code || '').trim().toUpperCase();
        submitData.append('referral_code', normalizedReferralCode);
      }

      // Process business profiles with NEW business fields
      const businessProfilesForBackend = formData.businessProfiles.map((profile, index) => {
        const { 
          business_profile_image, 
          media_gallery, 
          category_input, 
          business_registration_type_other, 
          branches,
          // Include the new business fields
          business_email,
          business_work_contact,
          business_address,
          business_city,
          business_state,
          business_zip_code,
          ...profileData 
        } = profile;

        // Normalize tags
        const normalizedTags = Array.isArray(profile.tags)
          ? profile.tags.join(',')
          : (typeof profile.tags === 'string' ? profile.tags : '');

        // Handle category
        const validCategoryIds = new Set((categories || []).map(c => String(c.cid)));
        const normalizedCategoryId = profileData.category_id && validCategoryIds.has(String(profileData.category_id))
          ? String(profileData.category_id)
          : '';

        // Handle registration type
        const normalizedRegistrationType = (profileData.business_registration_type === 'Others'
          ? (business_registration_type_other || '').trim()
          : profileData.business_registration_type) || '';

        const payload = { 
          ...profileData, 
          business_registration_type: normalizedRegistrationType, 
          category_id: normalizedCategoryId, 
          tags: normalizedTags,
          // Include the new business fields in the payload
          business_email: business_email || '',
          business_work_contact: business_work_contact || '',
          business_address: business_address || '',
          business_city: business_city || '',
          business_state: business_state || '',
          business_zip_code: business_zip_code || '',
          // Include simplified branch data in the payload
          branches: branches || []
        };

        if (!normalizedCategoryId && (category_input || '').trim()) {
          payload.new_category_name = (category_input || '').trim();
        }

        return payload;
      });

      submitData.append('business_profiles', JSON.stringify(businessProfilesForBackend));

      // Handle business profile images and media gallery files separately
      formData.businessProfiles.forEach((profile, index) => {
        if (profile.business_profile_image) {
          submitData.append(`business_profile_image_${index}`, profile.business_profile_image);
        }

        // Handle media gallery files
        if (profile.media_gallery && profile.media_gallery.length > 0) {
          profile.media_gallery.forEach((file) => {
            submitData.append(`media_gallery_${index}`, file);
          });
        }
      });

      // Append family details
      const isMarried = (formData.marital_status || '').toLowerCase().trim() === 'married';
      const childrenArray = (formData.children_names || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const familyDetails = {
        father_name: formData.father_name || '',
        father_contact: formData.father_contact || '',
        mother_name: formData.mother_name || '',
        mother_contact: formData.mother_contact || '',
        address: formData.family_address || '',
      };
      if (isMarried) {
        familyDetails.spouse_name = formData.spouse_name || '';
        familyDetails.spouse_contact = formData.spouse_contact || '';
        const numChildren = parseInt(formData.number_of_children || '0', 10) || 0;
        familyDetails.number_of_children = numChildren;
        if (numChildren > 0 && childrenArray.length > 0) {
          familyDetails.children_names = childrenArray;
        }
      }
      submitData.append('family_details', JSON.stringify(familyDetails));

      // Log the FormData for debugging (note: this won't show file contents)
      console.log('Submitting form data with business fields:', businessProfilesForBackend);
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? '[File]' : pair[1]));
      }

      const response = await fetch(`${baseurl}/api/member/register`, {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Server response:', result);
        throw new Error(result.msg || result.message || 'Registration failed');
      }

      if (result.success) {
        handleStepChange(5, 'forward'); // Move to success step
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInformation 
          formData={formData}
          validationErrors={validationErrors}
          createInputChangeHandler={createInputChangeHandler}
          createNumericInputChangeHandler={createNumericInputChangeHandler}
          handleInputChange={handleInputChange}
          onRemoveProfileImage={handleRemoveProfileImage}
          nextStep={nextStep}
        />;
      case 2:
        return <AddressDetails 
          formData={formData}
          validationErrors={validationErrors}
          createInputChangeHandler={createInputChangeHandler}
          createNumericInputChangeHandler={createNumericInputChangeHandler}
          handleInputChange={handleInputChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />;
      case 3:
        return <BusinessProfile 
          formData={formData}
          validationErrors={validationErrors}
          createBusinessInputChangeHandler={createBusinessInputChangeHandler}
          createBusinessNumericInputChangeHandler={createBusinessNumericInputChangeHandler}
          handleBusinessProfileChange={handleBusinessProfileChange}
          handleBusinessFileUpload={handleBusinessFileUpload}
          addBusinessProfile={addBusinessProfile}
          nextStep={nextStep}
          prevStep={prevStep}
          onRemoveBusinessProfileImage={handleRemoveBusinessProfileImage}
          onRemoveBusinessMedia={handleRemoveBusinessMedia}
          onRemoveBusinessProfile={removeBusinessProfile}
          categoriesOptions={categories}
          handleCategoryInputChange={handleCategoryInputChange}
          handleSelectExistingCategory={handleSelectExistingCategory}
          handleTagAdd={handleTagAdd}
          handleTagRemove={handleTagRemove}
          // Simplified branch handlers
          handleAddBranch={handleAddBranch}
          handleUpdateBranch={handleUpdateBranch}
          handleRemoveBranch={handleRemoveBranch}
        />;
      case 4:
        return <FamilyDetails 
          formData={formData}
          createInputChangeHandler={createInputChangeHandler}
          createNumericInputChangeHandler={createNumericInputChangeHandler}
          handleInputChange={handleInputChange}
          nextStep={nextStep}
          loading={loading}
          error={error}
          memberSuggestions={memberSuggestions}
          onFillFamily={handleFillFamilyFromSuggestion}
          validationErrors={validationErrors}
        />;
      case 5:
        return <CompleteStep 
          navigate={navigate}
        />;
      default:
        return <PersonalInformation 
          formData={formData}
          validationErrors={validationErrors}
          createInputChangeHandler={createInputChangeHandler}
          handleInputChange={handleInputChange}
          onRemoveProfileImage={handleRemoveProfileImage}
          nextStep={nextStep}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <TopHeader navigate={navigate} />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <StepIndicator 
            currentStep={currentStep}
            steps={steps}
            handleStepChange={handleStepChange}
          />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 lg:p-12">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;