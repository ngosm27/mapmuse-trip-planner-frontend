import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Tabs,
	Tab,
	Card,
	CardContent,
	Chip,
	Button,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	CircularProgress,
	Skeleton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import { PURPLE, PURPLE_DARK, BG } from "../constants";
import API from "../api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);

function isUpcoming(trip) {
	return new Date(trip.endDate) >= today;
}

function formatDateRange(startDate, endDate) {
	const fmt = (d) =>
		new Date(d).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function daysUntil(startDate) {
    const diff = new Date(startDate).getTime() - today.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Purple-family gradients
const gradients = [
	"linear-gradient(135deg, #c4b5fd 0%, #818cf8 100%)",
	"linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)",
	"linear-gradient(135deg, #d8b4fe 0%, #a78bfa 100%)",
	"linear-gradient(135deg, #818cf8 0%, #6d28d9 100%)",
	"linear-gradient(135deg, #e9d5ff 0%, #a855f7 100%)",
	"linear-gradient(135deg, #c4b5fd 0%, #ec4899 100%)",
];
function pickGradient(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++)
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	return gradients[Math.abs(hash) % gradients.length];
}

// ── Trip card ─────────────────────────────────────────────────────────────────
type Trip = {
    id: number;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
};
function TripCard({trip, isPast, onClick}: {
    trip: Trip;
    isPast: boolean;
    onClick: () => void;
}) {
    const days = daysUntil(trip.startDate);

	return (
		<Card
			elevation={0}
			onClick={onClick}
			sx={{
				border: "1px solid #e8e8e8",
				borderRadius: 3,
				overflow: "hidden",
				cursor: "pointer",
				transition: "box-shadow 0.2s, transform 0.2s",
				"&:hover": {
					boxShadow: "0 8px 30px rgba(139,92,246,0.15)",
					transform: "translateY(-2px)",
				},
			}}
		>
			{/* Gradient banner */}
			<Box
				sx={{
					height: 80,
					background: pickGradient(trip.destination),
					display: "flex",
					alignItems: "center",
					px: 3,
					position: "relative",
				}}
			>
				<PlaceIcon
					sx={{ fontSize: 40, color: "rgba(255,255,255,0.85)" }}
				/>
				{!isPast && days > 0 && (
					<Chip
						label={`${days} days away`}
						size="small"
						sx={{
							position: "absolute",
							right: 16,
							backgroundColor: "rgba(255,255,255,0.9)",
							fontWeight: 700,
							fontSize: "0.75rem",
							color: "#1a1a1a",
						}}
					/>
				)}
				{!isPast && days <= 0 && (
					<Chip
						label="In progress"
						size="small"
						sx={{
							position: "absolute",
							right: 16,
							backgroundColor: "#dcfce7",
							fontWeight: 700,
							fontSize: "0.75rem",
							color: "#16a34a",
						}}
					/>
				)}
			</Box>

			<CardContent sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.25 }}
				>
					{trip.name}
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: "#7c3aed", fontWeight: 600, mb: 1 }}
				>
					{trip.destination}
				</Typography>

				<Stack
					direction="row"
					sx={{
						mb: 2,
						alignItems: "center",
						gap: 0.75
					}}
				>
					<CalendarTodayIcon
						sx={{ fontSize: 14, color: "#9ca3af" }}
					/>
					<Typography variant="body2" sx={{ color: "#6b7280" }}>
						{formatDateRange(trip.startDate, trip.endDate)}
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TripSkeleton() {
	return (
		<Card
			elevation={0}
			sx={{
				border: "1px solid #e8e8e8",
				borderRadius: 3,
				overflow: "hidden",
			}}
		>
			<Skeleton variant="rectangular" height={80} />
			<CardContent sx={{ p: 3 }}>
				<Skeleton width="60%" height={28} sx={{ mb: 0.5 }} />
				<Skeleton width="40%" height={20} sx={{ mb: 1 }} />
				<Skeleton width="55%" height={18} sx={{ mb: 2 }} />
			</CardContent>
		</Card>
	);
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ isPast }) {
	return (
		<Box
			sx={{
				gridColumn: "1 / -1",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				py: 10,
			}}
		>
			{isPast ? (
				<FlightLandIcon
					sx={{ fontSize: 56, mb: 2, color: "#d1d5db" }}
				/>
			) : (
				<FlightTakeoffIcon
					sx={{ fontSize: 56, mb: 2, color: "#d1d5db" }}
				/>
			)}
			<Typography
				variant="h6"
				sx={{ fontWeight: 600, color: "#6b7280", mb: 0.5 }}
			>
				{isPast ? "No past trips yet" : "No upcoming trips planned"}
			</Typography>
			<Typography variant="body2" sx={{ color: "#9ca3af" }}>
				{isPast
					? "Your completed adventures will appear here."
					: "Hit 'New trip' to start planning!"}
			</Typography>
		</Box>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Trips({ onNav }) {
	const [tab, setTab] = useState(0);
	const [trips, setTrips] = useState<Trip[]>([]);
	const [loading, setLoading] = useState(true);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newTripLoading, setNewTripLoading] = useState(false);
	const [destination, setDestination] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const loadTrips = async () => {
		setLoading(true);
		setError(null);
		const start = Date.now();

		const profile = JSON.parse(
			localStorage.getItem("travelerProfile") || "{}",
		);
		const userId = profile?.id;
		console.log("userId:", userId);
		if (!userId) {
			setError("Unable to load trips because no user is signed in.");
			setLoading(false);
			return;
		}

		try {
			const res = await API.get(`/trip/user/${userId}`);
			setTrips(res.data);
		} catch (err) {
			setError("Failed to load trips.");
		} finally {
			const elapsed = Date.now() - start;
			setTimeout(() => setLoading(false), Math.max(0, 2000 - elapsed));
		}
	};

	useEffect(() => {
		loadTrips();
	}, []);

	const handleOpenDialog = () => {
		setDestination("");
		setStartDate("");
		setEndDate("");
		setFormError(null);
		setIsDialogOpen(true);
	};

	const handleCreateTrip = async () => {
		if (!destination || !startDate || !endDate) {
			setFormError("Please enter destination, start date, and end date.");
			return;
		}

		if (startDate > endDate) {
			setFormError(
				"End date must be the same as or after the start date.",
			);
			return;
		}

		const profile = JSON.parse(
			localStorage.getItem("travelerProfile") || "{}",
		);
		const userId = profile?.id;

		if (!userId) {
			setFormError("Unable to create trip because no user is signed in.");
			return;
		}

		setNewTripLoading(true);
		setFormError(null);
		setError(null);

		try {
			await API.post(`/recommendations/${userId}`, {
				destination,
				startDate,
				endDate,
			});

			// Close the dialog
			setIsDialogOpen(false);

			// Reload the trips from the database
			await loadTrips();

		} catch (err) {
			console.error("Error creating trip:", err);
			console.error("Error response:", err.response);
			console.error("Error response data:", err.response?.data);

			setFormError(
				"Unable to create a new trip. Please try again.",
			);
		} finally {
			setNewTripLoading(false);
		}
	};

	const upcoming = trips.filter((t) => isUpcoming(t));
	const past = trips.filter((t) => !isUpcoming(t));
	const isPast = tab === 1;
	const visible = isPast ? past : upcoming;

	return (
		<Box sx={{ minHeight: "calc(100svh - 64px)", backgroundColor: BG }}>
			{/* Header */}
			<Box
				sx={{
					backgroundColor: "#fff",
					borderBottom: "1px solid #e8e8e8",
					px: { xs: 3, md: 6 },
					pt: 4,
					pb: 0,
				}}
			>
				<Box sx={{ maxWidth: 1100, mx: "auto" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-end",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 2,
							mb: 2,
						}}
					>
						<Box>
							<Stack
							direction="row"
							sx={{
								mb: 2,
								alignItems: "center",
								gap: 1,
							}}
>
								<PlaceIcon
									sx={{ color: PURPLE, fontSize: 22 }}
								/>
								<Typography
									variant="h5"
									sx={{
										fontWeight: 800,
										color: "#1a1a1a",
										fontFamily: "Georgia, serif",
									}}
								>
									My Trips
								</Typography>
							</Stack>
							<Typography
								variant="body2"
								sx={{ color: "#6b7280" }}
							>
								{loading
									? "Loading…"
									: `${upcoming.length} upcoming · ${past.length} past`}
							</Typography>
						</Box>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpenDialog}
							sx={{
								backgroundColor: PURPLE,
								color: "#fff",
								textTransform: "none",
								fontWeight: 600,
								borderRadius: 2,
								px: 2.5,
								mb: 1,
								"&:hover": { backgroundColor: PURPLE_DARK },
							}}
						>
							New trip
						</Button>
					</Box>
					<Dialog
						open={isDialogOpen}
						onClose={() => setIsDialogOpen(false)}
						slotProps={{
							paper: {
								sx: { borderRadius: 3 },
							},
						}}
					>
						<DialogTitle>New trip</DialogTitle>
						<DialogContent>
							<Stack spacing={2} sx={{ width: 420, mt: 1 }}>
								<TextField
									label="Destination"
									fullWidth
									size="small"
									value={destination}
									onChange={(e) =>
										setDestination(e.target.value)
									}
								/>
								<LocalizationProvider
									dateAdapter={AdapterDateFns}
								>
									<DatePicker
										label="Start date"
										value={startDate ? new Date(startDate) : null}
										onChange={(value) =>
											setStartDate(
												value
													? value.toISOString().slice(0, 10)
													: "",
											)
										}
										slotProps={{
											textField: {
												fullWidth: true,
												size: "small",
											},
										}}
									/>

									<DatePicker
										label="End date"
										value={
											endDate ? new Date(endDate) : null
										}
										onChange={(value) =>
											setEndDate(
												value
													? value
															.toISOString()
															.slice(0, 10)
													: "",
											)
										}
										slotProps={{
											textField: {
												fullWidth: true,
												size: "small",
											},
										}}
									/>
								</LocalizationProvider>
								{formError && (
									<Typography
										variant="body2"
										sx={{ color: "#ef4444" }}
									>
										{formError}
									</Typography>
								)}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2 }}>
							<Button
								onClick={() => setIsDialogOpen(false)}
								sx={{ textTransform: "none" }}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								onClick={handleCreateTrip}
								disabled={newTripLoading}
								sx={{
									textTransform: "none",
									color: "#fff",
									backgroundColor: PURPLE,
									"&:hover": { backgroundColor: PURPLE_DARK },
								}}
							>
								{newTripLoading ? (
									<Stack
										direction="row"
										sx={{
											alignItems: "center",
											gap: 1
										}}
									>
										<CircularProgress
											size={18}
											color="inherit"
										/>
										Creating...
									</Stack>
								) : (
									"Create trip"
								)}
							</Button>
						</DialogActions>
					</Dialog>

					<Tabs
						value={tab}
						onChange={(_, v) => setTab(v)}
						sx={{
							"& .MuiTab-root": {
								textTransform: "none",
								fontWeight: 600,
								fontSize: "0.9rem",
								color: "#6b7280",
								minWidth: 0,
								px: 0,
								mr: 4,
							},
							"& .Mui-selected": { color: "#1a1a1a" },
							"& .MuiTabs-indicator": {
								backgroundColor: PURPLE,
								height: 3,
								borderRadius: 2,
							},
						}}
					>
						<Tab
							label={
								<Stack
									direction="row"
									sx={{
										alignItems: "center",
										gap: 1,
									}}
								>
									<FlightTakeoffIcon sx={{ fontSize: 16 }} />
									Upcoming
									{!loading && (
										<Chip
											label={upcoming.length}
											size="small"
											sx={{
												height: 18,
												fontSize: "0.7rem",
												backgroundColor:
													"rgba(208,191,255,0.3)",
												color: "#7c3aed",
												fontWeight: 700,
											}}
										/>
									)}
								</Stack>
							}
						/>
						<Tab
							label={
								<Stack
									direction="row"
									sx={{
										alignItems: "center",
										gap: 1,
									}}
								>	
									<FlightLandIcon sx={{ fontSize: 16 }} />
									Past
									{!loading && (
										<Chip
											label={past.length}
											size="small"
											sx={{
												height: 18,
												fontSize: "0.7rem",
												backgroundColor: "#f3f4f6",
												color: "#6b7280",
												fontWeight: 700,
											}}
										/>
									)}
								</Stack>
							}
						/>
					</Tabs>
				</Box>
			</Box>

			{/* Grid */}
			<Box
				sx={{
					maxWidth: 1100,
					mx: "auto",
					px: { xs: 3, md: 6 },
					py: 4,
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						lg: "repeat(3, 1fr)",
					},
					gap: 3,
				}}
			>
				{error && (
					<Typography
						sx={{
							gridColumn: "1 / -1",
							color: "#ef4444",
							textAlign: "center",
							py: 6,
						}}
					>
						{error}
					</Typography>
				)}
				{loading &&
					!error &&
					[1, 2, 3].map((n) => <TripSkeleton key={n} />)}
				{!loading && !error && visible.length === 0 && (
					<EmptyState isPast={isPast} />
				)}
				{!loading &&
					!error &&
					visible.map((trip) => (
						<TripCard
							key={trip.id}
							trip={trip}
							isPast={isPast}
							onClick={() => onNav("itinerary", trip)}
						/>
					))}
			</Box>
		</Box>
	);
}
