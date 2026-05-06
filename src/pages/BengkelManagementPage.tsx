import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../services/api";
import { BuildingStorefrontIcon, ClockIcon, WrenchScrewdriverIcon, PhotoIcon, MapPinIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { Bengkel, BengkelOperational, BengkelService } from "../types/api";

interface ApiError {
    response?: {
        data?: { message?: string };
        status?: number;
    };
    message?: string;
}

const BengkelManagementPage: React.FC = () => {
    const { mitra, isAuthenticated, userType } = useAuth();
    const [bengkel, setBengkel] = useState<Bengkel | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form states
    const [profileForm, setProfileForm] = useState({
        bengkel_name: "",
        bengkel_phone: "",
        jumlah_montir: 1,
    });

    const [serviceOptions, setServiceOptions] = useState({
        home_service: false,
        store_service: false,
        is_open: false,
    });

    const [operationalHours, setOperationalHours] = useState<BengkelOperational[]>([]);

    // New operational hours form for creation
    const [createOperationalForm, setCreateOperationalForm] = useState({
        operasionals: [
            { hari: "Senin", jam_buka: "08:00", jam_tutup: "17:00", is_active: true },
            { hari: "Selasa", jam_buka: "08:00", jam_tutup: "17:00", is_active: true },
            { hari: "Rabu", jam_buka: "08:00", jam_tutup: "17:00", is_active: true },
            { hari: "Kamis", jam_buka: "08:00", jam_tutup: "17:00", is_active: true },
            { hari: "Jumat", jam_buka: "08:00", jam_tutup: "17:00", is_active: true },
        ],
    });

    const [newService, setNewService] = useState("");
    const [newServiceDescription, setNewServiceDescription] = useState("");
    const [newServicePrice, setNewServicePrice] = useState(0);
    const [editingService, setEditingService] = useState<number | null>(null);
    const [editServiceData, setEditServiceData] = useState({
        nama_service: "",
        description: "",
        price: 0,
        is_available: true,
    });
    const [addressForm, setAddressForm] = useState({
        address_label: "",
        full_address: "",
        latitude: 0,
        longitude: 0,
        note: "",
    });

    useEffect(() => {
        console.log("BengkelManagementPage mounted");
        console.log("Authentication status:", { isAuthenticated, userType, mitra });
        console.log("Access token:", localStorage.getItem("access_token") ? "Present" : "Missing");
        loadBengkelProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBengkelProfile = async () => {
        try {
            setLoading(true);

            // First, get the mitra profile to see if they have any bengkels
            const mitraResponse = await apiService.getMitraProfile();
            console.log("Mitra response:", mitraResponse);

            if (mitraResponse.success && mitraResponse.data) {
                const mitraData = mitraResponse.data;
                console.log("Mitra data:", mitraData);
                console.log("Bengkel array:", mitraData.bengkel);

                // Check if mitra has any bengkels
                if (mitraData.bengkel && mitraData.bengkel.length > 0) {
                    // Use the first bengkel (assuming one bengkel per mitra for now)
                    const bengkelData = mitraData.bengkel[0];
                    console.log("Bengkel data:", bengkelData);
                    setBengkel(bengkelData);

                    // Populate forms with existing data
                    setProfileForm({
                        bengkel_name: bengkelData.bengkel_name || "",
                        bengkel_phone: bengkelData.bengkel_phone || "",
                        jumlah_montir: bengkelData.jumlah_montir || 1,
                    });

                    setServiceOptions({
                        home_service: bengkelData.home_service || false,
                        store_service: bengkelData.store_service || false,
                        is_open: bengkelData.is_open || false,
                    });

                    setOperationalHours(bengkelData.operasionals || []);
                } else {
                    // Mitra doesn't have a bengkel yet
                    console.log("No bengkel found in mitra data");
                    setBengkel(null);
                    setError("No bengkel found. Please create a bengkel first.");
                }
            }
        } catch (err: unknown) {
            console.error("Failed to load bengkel profile:", err);
            setError("Failed to load bengkel profile");
        } finally {
            setLoading(false);
        }
    };

    const createBengkel = async () => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            // Use the new V2 method that supports operational hours during creation
            const response = await apiService.createBengkelV2({
                bengkel_name: profileForm.bengkel_name,
                bengkel_phone: profileForm.bengkel_phone,
                jumlah_montir: profileForm.jumlah_montir,
                operasionals: createOperationalForm.operasionals,
            });

            if (response.success) {
                setSuccess("Bengkel created successfully with operational hours!");
                await loadBengkelProfile(); // Reload to get the new bengkel data
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to create bengkel:", err);
            setError(error.response?.data?.message || "Failed to create bengkel");
        } finally {
            setUpdating(false);
        }
    };

    const updateProfile = async () => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await apiService.updateBengkelProfile(profileForm);

            if (response.success) {
                setSuccess("Profile updated successfully!");
                await loadBengkelProfile(); // Reload to get updated data
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to update profile:", err);
            setError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const updateServiceOptions = async () => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await apiService.updateBengkelServiceOptions(serviceOptions);

            if (response.success) {
                setSuccess("Service options updated successfully!");
                await loadBengkelProfile(); // Reload to get updated data
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to update service options:", err);
            setError(error.response?.data?.message || "Failed to update service options");
        } finally {
            setUpdating(false);
        }
    };

    const updateOperationalHours = async () => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            // Convert to new API format
            const operationalData = {
                operasionals: operationalHours.map((op) => ({
                    id: op.id || 0, // 0 for new records
                    hari: op.hari,
                    jam_buka: op.jam_buka,
                    jam_tutup: op.jam_tutup || "17:00", // Default closing time
                    is_active: true, // Assume active if in the list
                })),
            };

            const response = await apiService.updateBengkelOperationalV2(operationalData);

            if (response.success) {
                setSuccess("Operational hours updated successfully!");
                await loadBengkelProfile();
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to update operational hours:", err);
            setError(error.response?.data?.message || "Failed to update operational hours");
        } finally {
            setUpdating(false);
        }
    };

    const addService = async () => {
        if (!isAuthenticated) {
            setError("Please log in as a mitra first");
            return;
        }

        if (userType !== "mitras") {
            setError("Please log in as a mitra to add services");
            return;
        }

        if (!newService.trim()) {
            return;
        }

        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const serviceData = {
                services: [
                    {
                        nama_service: newService.trim(),
                        description: newServiceDescription.trim(),
                        price: newServicePrice,
                        is_available: true,
                    },
                ],
            };

            const response = await apiService.addBengkelService(serviceData);

            if (response.success) {
                setSuccess("Service added successfully!");
                setNewService("");
                setNewServiceDescription("");
                setNewServicePrice(0);
                await loadBengkelProfile();
            } else {
                setError(response.message || "Failed to add service");
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to add service:", err);

            // Handle specific authentication errors
            if (error.response?.status === 401) {
                setError("Authentication failed. Please log in as a mitra.");
            } else if (error.response?.status === 403) {
                setError("Access denied. Please ensure you are logged in as a mitra.");
            } else {
                setError(error.response?.data?.message || error.message || "Failed to add service");
            }
        } finally {
            setUpdating(false);
        }
    };

    const updateService = async () => {
        if (!editingService) return;

        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const serviceData = {
                services: [
                    {
                        id: editingService,
                        nama_service: editServiceData.nama_service.trim(),
                        description: editServiceData.description.trim(),
                        price: editServiceData.price,
                        is_available: editServiceData.is_available,
                    },
                ],
            };

            const response = await apiService.updateBengkelService(serviceData);

            if (response.success) {
                setSuccess("Service updated successfully!");
                setEditingService(null);
                setEditServiceData({
                    nama_service: "",
                    description: "",
                    price: 0,
                    is_available: true,
                });
                await loadBengkelProfile();
            } else {
                setError(response.message || "Failed to update service");
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to update service:", err);
            setError(error.response?.data?.message || error.message || "Failed to update service");
        } finally {
            setUpdating(false);
        }
    };

    const deleteService = async (serviceId: number) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await apiService.deleteBengkelService(serviceId);

            if (response.success) {
                setSuccess("Service deleted successfully!");
                await loadBengkelProfile();
            } else {
                setError(response.message || "Failed to delete service");
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to delete service:", err);
            setError(error.response?.data?.message || error.message || "Failed to delete service");
        } finally {
            setUpdating(false);
        }
    };

    const startEditService = (service: BengkelService) => {
        setEditingService(service.id);
        setEditServiceData({
            nama_service: service.nama_service,
            description: service.description || "",
            price: service.price || 0,
            is_available: service.is_available !== false,
        });
    };

    const cancelEdit = () => {
        setEditingService(null);
        setEditServiceData({
            nama_service: "",
            description: "",
            price: 0,
            is_available: true,
        });
    };

    const addAddress = async () => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await apiService.addBengkelAddress(addressForm);

            if (response.success) {
                setSuccess("Address added successfully!");
                setAddressForm({
                    address_label: "",
                    full_address: "",
                    latitude: 0,
                    longitude: 0,
                    note: "",
                });
                await loadBengkelProfile();
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to add address:", err);
            setError(error.response?.data?.message || "Failed to add address");
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await apiService.uploadBengkelPhotos(files);

            if (response.success) {
                setSuccess(`${files.length} photo(s) uploaded successfully!`);
                await loadBengkelProfile();
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error("Failed to upload photos:", err);
            setError(error.response?.data?.message || "Failed to upload photos");
        } finally {
            setUpdating(false);
        }
    };

    const handleOperationalChange = (day: string, field: "jam_buka" | "jam_tutup" | "enabled", value: string | boolean) => {
        setOperationalHours((prev) => {
            const existing = prev.find((op) => op.hari === day);
            if (existing) {
                return prev.map((op) =>
                    op.hari === day
                        ? {
                              ...op,
                              [field === "enabled" ? "is_active" : field]: value,
                              // Only set default jam_tutup if it doesn't exist and we're not updating it
                              ...(field !== "jam_tutup" && !op.jam_tutup ? { jam_tutup: "17:00" } : {}),
                          }
                        : op,
                );
            } else if (field === "enabled" && value === true) {
                return [
                    ...prev,
                    {
                        id: 0,
                        hari: day,
                        jam_buka: "08:00",
                        jam_tutup: "17:00",
                        is_active: true,
                    },
                ];
            }
            return prev;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated || userType !== "mitras") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please log in as a mitra to access this page.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Current status: {isAuthenticated ? "Authenticated" : "Not authenticated"}
                        {userType && ` as ${userType}`}
                    </p>
                </div>
            </div>
        );
    }

    // If no bengkel exists, show create bengkel form
    if (!bengkel && !loading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Your Bengkel</h1>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">You don't have a bengkel yet. Create one to start managing your workshop.</p>
                    </div>
                </div>

                {error && <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>}

                <div className="mt-8 max-w-md">
                    <div className="card">
                        <div className="flex items-center space-x-3 mb-4">
                            <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Information</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bengkel Name</label>
                                <input type="text" className="input-field" placeholder="Enter bengkel name" value={profileForm.bengkel_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, bengkel_name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <input type="tel" className="input-field" placeholder="Enter phone number" value={profileForm.bengkel_phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, bengkel_phone: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Mechanics</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter number of mechanics"
                                    min="1"
                                    value={profileForm.jumlah_montir}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, jumlah_montir: parseInt(e.target.value) || 1 }))}
                                />
                            </div>

                            {/* Operational Hours */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operational Hours</label>
                                <div className="space-y-2">
                                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day, index) => {
                                        const existing = createOperationalForm.operasionals.find((op) => op.hari === day);
                                        return (
                                            <div key={day} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id={`day-${index}`}
                                                    checked={!!existing && existing.is_active}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setCreateOperationalForm((prev) => ({
                                                                operasionals: [...prev.operasionals.filter((op) => op.hari !== day), { hari: day, jam_buka: "08:00", jam_tutup: "17:00", is_active: true }],
                                                            }));
                                                        } else {
                                                            setCreateOperationalForm((prev) => ({
                                                                operasionals: prev.operasionals.filter((op) => op.hari !== day),
                                                            }));
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`day-${index}`} className="text-sm text-gray-700 dark:text-gray-300 w-16">
                                                    {day}
                                                </label>
                                                {existing && existing.is_active && (
                                                    <>
                                                        <input
                                                            type="time"
                                                            value={existing.jam_buka}
                                                            onChange={(e) => {
                                                                setCreateOperationalForm((prev) => ({
                                                                    operasionals: prev.operasionals.map((op) => (op.hari === day ? { ...op, jam_buka: e.target.value } : op)),
                                                                }));
                                                            }}
                                                            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                        />
                                                        <span className="text-gray-500 dark:text-gray-400">-</span>
                                                        <input
                                                            type="time"
                                                            value={existing.jam_tutup}
                                                            onChange={(e) => {
                                                                setCreateOperationalForm((prev) => ({
                                                                    operasionals: prev.operasionals.map((op) => (op.hari === day ? { ...op, jam_tutup: e.target.value } : op)),
                                                                }));
                                                            }}
                                                            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button className="btn-primary w-full" onClick={createBengkel} disabled={updating || !profileForm.bengkel_name || !profileForm.bengkel_phone || createOperationalForm.operasionals.length === 0}>
                                {updating ? "Creating..." : "Create Bengkel"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Bengkel</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage your bengkel profile, services, and operational settings.</p>
                </div>
            </div>

            {/* Status Messages */}
            {error && <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>}
            {success && <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">{success}</div>}

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bengkel Profile */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bengkel Name</label>
                            <input type="text" className="input-field" placeholder="Enter bengkel name" value={profileForm.bengkel_name} onChange={(e) => setProfileForm((prev) => ({ ...prev, bengkel_name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" className="input-field" placeholder="Enter phone number" value={profileForm.bengkel_phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, bengkel_phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Mechanics</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Enter number of mechanics"
                                min="1"
                                value={profileForm.jumlah_montir}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, jumlah_montir: parseInt(e.target.value) || 1 }))}
                            />
                        </div>
                        <button className="btn-primary" onClick={updateProfile} disabled={updating}>
                            {updating ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </div>

                {/* Service Options */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Options</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.home_service} onChange={(e) => setServiceOptions((prev) => ({ ...prev, home_service: e.target.checked }))} />
                            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Home Service Available</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.store_service} onChange={(e) => setServiceOptions((prev) => ({ ...prev, store_service: e.target.checked }))} />
                            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Store Service Available</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.is_open} onChange={(e) => setServiceOptions((prev) => ({ ...prev, is_open: e.target.checked }))} />
                            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Currently Open</label>
                        </div>
                        <button className="btn-primary" onClick={updateServiceOptions} disabled={updating}>
                            {updating ? "Updating..." : "Update Options"}
                        </button>
                    </div>
                </div>

                {/* Operational Hours */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <ClockIcon className="h-6 w-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Operational Hours</h2>
                    </div>
                    <div className="space-y-3">
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => {
                            const existing = operationalHours.find((op) => op.hari === day);
                            const isActive = existing?.is_active !== false; // true if not explicitly false

                            return (
                                <div key={day} className="flex items-center space-x-3">
                                    <div className="w-20 text-sm text-gray-700 dark:text-gray-300">{day}</div>
                                    <input type="time" className="input-field flex-1" value={existing?.jam_buka || "08:00"} disabled={!existing} onChange={(e) => handleOperationalChange(day, "jam_buka", e.target.value)} />
                                    <span className="text-gray-500 dark:text-gray-400">-</span>
                                    <input type="time" className="input-field flex-1" value={existing?.jam_tutup || "17:00"} disabled={!existing} onChange={(e) => handleOperationalChange(day, "jam_tutup", e.target.value)} />
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 rounded"
                                        checked={!!existing && isActive}
                                        onChange={(e) => {
                                            if (!e.target.checked) {
                                                setOperationalHours((prev) => prev.filter((op) => op.hari !== day));
                                            } else {
                                                handleOperationalChange(day, "enabled", true);
                                            }
                                        }}
                                    />
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Open</label>
                                </div>
                            );
                        })}
                    </div>
                    <button className="btn-primary mt-4" onClick={updateOperationalHours} disabled={updating}>
                        {updating ? "Updating..." : "Update Hours"}
                    </button>
                </div>

                {/* Address */}
                <div className="card">
                    <div className="flex items-center space-x-3 mb-6">
                        <MapPinIcon className="h-6 w-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address Management</h2>
                    </div>

                    {/* Add Address Form */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Address</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Label *</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="e.g., Main Workshop, Branch Office"
                                    value={addressForm.address_label}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, address_label: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Address *</label>
                                <textarea
                                    className="input-field w-full"
                                    rows={3}
                                    placeholder="Enter complete address with street, city, postal code"
                                    value={addressForm.full_address}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, full_address: e.target.value }))}
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input-field w-full"
                                        placeholder="-6.2088"
                                        value={addressForm.latitude}
                                        onChange={(e) => setAddressForm((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input-field w-full"
                                        placeholder="106.8456"
                                        value={addressForm.longitude}
                                        onChange={(e) => setAddressForm((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="e.g., Near the main road, blue building"
                                    value={addressForm.note}
                                    onChange={(e) => setAddressForm((prev) => ({ ...prev, note: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="btn-primary flex items-center" onClick={addAddress} disabled={updating || !addressForm.address_label.trim() || !addressForm.full_address.trim()}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    {updating ? "Adding..." : "Add Address"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Addresses */}
                    {bengkel?.addresses && bengkel.addresses.length > 0 ? (
                        <div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Your Addresses ({bengkel.addresses.length})</h3>
                            <div className="space-y-3">
                                {bengkel.addresses.map((address) => (
                                    <div key={address.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <MapPinIcon className="w-4 h-4 text-primary-600" />
                                                    <span className="font-medium text-sm text-gray-900 dark:text-white">{address.address_label}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{address.full_address}</p>
                                                {address.note && <p className="text-xs text-gray-500 dark:text-gray-400 italic">Note: {address.note}</p>}
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    Coordinates: {address.latitude}, {address.longitude}
                                                </div>
                                            </div>
                                            <div className="flex space-x-1 ml-4">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit address">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete address">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <MapPinIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm">No addresses added yet. Add your bengkel location above.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Services */}
            <div className="mt-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Services Offered</h2>
                        </div>
                    </div>

                    {/* Add Service Form */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Name *</label>
                                <input type="text" className="input-field w-full" placeholder="e.g., Ganti Oli Mesin" value={newService} onChange={(e) => setNewService(e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Rp)</label>
                                <input type="number" className="input-field w-full" placeholder="0" min="0" step="1000" value={newServicePrice} onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea className="input-field w-full" rows={3} placeholder="Describe your service in detail..." value={newServiceDescription} onChange={(e) => setNewServiceDescription(e.target.value)} />
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button className="btn-primary flex items-center" onClick={addService} disabled={updating || !newService.trim()}>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                {updating ? "Adding..." : "Add Service"}
                            </button>
                        </div>
                    </div>

                    {/* Services List */}
                    {bengkel?.services && bengkel.services.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">Your Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bengkel.services.map((service) => (
                                    <div key={service.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        {editingService === service.id ? (
                                            // Edit Mode
                                            <div className="space-y-3">
                                                <input type="text" className="input-field w-full text-sm" value={editServiceData.nama_service} onChange={(e) => setEditServiceData((prev) => ({ ...prev, nama_service: e.target.value }))} />
                                                <textarea className="input-field w-full text-sm" rows={2} value={editServiceData.description} onChange={(e) => setEditServiceData((prev) => ({ ...prev, description: e.target.value }))} />
                                                <input
                                                    type="number"
                                                    className="input-field w-full text-sm"
                                                    min="0"
                                                    step="1000"
                                                    value={editServiceData.price}
                                                    onChange={(e) => setEditServiceData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`available-${service.id}`}
                                                        checked={editServiceData.is_available}
                                                        onChange={(e) => setEditServiceData((prev) => ({ ...prev, is_available: e.target.checked }))}
                                                        className="h-4 w-4 text-primary-600 rounded"
                                                    />
                                                    <label htmlFor={`available-${service.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                                                        Available
                                                    </label>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={updateService} disabled={updating} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center justify-center">
                                                        <CheckIcon className="w-4 h-4 mr-1" />
                                                        Save
                                                    </button>
                                                    <button onClick={cancelEdit} className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 flex items-center justify-center">
                                                        <XMarkIcon className="w-4 h-4 mr-1" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <>
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{service.nama_service}</h4>
                                                    <div className="flex items-center space-x-1">
                                                        {service.is_available !== false ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Available</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Unavailable</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {service.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{service.description}</p>}

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {service.price && service.price > 0 ? (
                                                            <p className="text-sm font-semibold text-primary-600">Rp {service.price.toLocaleString("id-ID")}</p>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Price not set</p>
                                                        )}
                                                    </div>

                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => startEditService(service)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                            title="Edit service"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteService(service.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                            title="Delete service"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services yet</h3>
                            <p className="text-sm">Add your first service using the form above to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Photos */}
            <div className="mt-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <PhotoIcon className="h-6 w-6 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Photos</h2>
                        </div>
                        <div>
                            <input type="file" multiple accept="image/*" className="hidden" id="photo-upload" onChange={handlePhotoUpload} />
                            <label htmlFor="photo-upload" className="btn-primary cursor-pointer flex items-center">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Upload Photos
                            </label>
                        </div>
                    </div>

                    {bengkel?.photos && bengkel.photos.length > 0 ? (
                        <div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Gallery ({bengkel.photos.length} photos)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {bengkel.photos.map((photo) => (
                                    <div key={photo.id} className="relative group">
                                        <img src={photo.photo_url} alt="Bengkel" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-shadow" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                            <button className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No photos yet</h3>
                            <p className="text-sm mb-4">Upload photos to showcase your bengkel to potential customers.</p>
                            <label htmlFor="photo-upload" className="btn-primary cursor-pointer inline-flex items-center">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Upload Your First Photo
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BengkelManagementPage;
