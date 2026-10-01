import { useState, useEffect, useRef } from "react";
import {
	Box,
	Typography,
	Chip,
	Card,
	CardContent,
	Stack,
	Skeleton,
	Divider,
	IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import { PURPLE, PURPLE_DARK, BG } from "../constants";
import API from "../api";

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
	DINING: { label: "Dining", bg: "#fef3c7", color: "#92400e" },
	ACCOMMODATION: { label: "Accommodation", bg: "#d1fae5", color: "#065f46" },
	MUSEUM: { label: "Museum", bg: "#e0f2fe", color: "#0c4a6e" },
	SIGHTSEEING: { label: "Sightseeing", bg: "#dbeafe", color: "#1e40af" },
	SHOPPING: { label: "Shopping", bg: "#fce7f3", color: "#9d174d" },
	CLASS: { label: "Class", bg: "#ede9fe", color: "#5b21b6" },
	NIGHTLIFE: { label: "Nightlife", bg: "#fde68a", color: "#92400e" },
	TRANSPORTATION: {
		label: "Transportation",
		bg: "#f3f4f6",
		color: "#374151",
	},
	SPA: { label: "Spa", bg: "#dcfce7", color: "#166534" },
	OTHER: { label: "Other", bg: "#f3f4f6", color: "#4b5563" },
};
function categoryStyle(cat) {
	return (
		CATEGORY_STYLES[cat?.toUpperCase()] ?? {
			label: cat ?? "Other",
			bg: "#f3f4f6",
			color: "#374151",
		}
	);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(time) {
	if (!time) return null;
	// time arrives as "HH:MM:SS" from Spring
	const [h, m] = time.split(":");
	const hour = parseInt(h, 10);
	const ampm = hour >= 12 ? "PM" : "AM";
	const display = hour % 12 || 12;
	return `${display}:${m} ${ampm}`;
}

function getDatesInRange(startDate, endDate) {
	const dates = [];
	const cur = new Date(startDate);
	const end = new Date(endDate);
	while (cur <= end) {
		(dates as string[]).push(cur.toISOString().split("T")[0]);
		cur.setDate(cur.getDate() + 1);
	}
	return dates;
}

function formatTabDate(dateStr) {
	const d = new Date(dateStr + "T00:00:00");
	return {
		day: d.toLocaleDateString("en-US", { weekday: "short" }),
		date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
	};
}

// ── Activity card ─────────────────────────────────────────────────────────────
function ActivityCard({ activity }) {
	const cat = categoryStyle(activity.category);

	return (
		<Card
			elevation={0}
			sx={{
				border: "1px solid #e8e8e8",
				borderRadius: 3,
				mb: 2,
				transition: "box-shadow 0.15s",
				"&:hover": {
					boxShadow: "0 4px 16px rgba(139,92,246,0.1)",
				},
			}}
		>
			<CardContent
				sx={{
					p: 3,
					"&:last-child": { pb: 3 },
					textAlign: "left",
				}}
			>
				{/* Category */}
				<Stack
					direction="row"
					sx={{
						mb: 1,
						gap: 1,
						alignItems: "center",
					}}
				>
					<Chip
						label={cat.label}
						size="small"
						sx={{
							backgroundColor: cat.bg,
							color: cat.color,
							fontWeight: 600,
							fontSize: "0.7rem",
							height: 22,
						}}
					/>
				</Stack>

				{/* Activity name / website link */}
				<Typography
					variant="h6"
					sx={{
						textAlign: "left",
						fontWeight: 600,
						fontSize: "1.1rem",
						mb: 1,
					}}
				>
					{activity.websiteUrl ? (
						<a
							href={activity.websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "#6A1B9A",
								textDecoration: "underline",
								cursor: "pointer",
							}}
						>
							{activity.activityName}
						</a>
					) : (
						activity.activityName
					)}
				</Typography>

				{/* Location */}
				{activity.location && (
					<Stack
						direction="row"
						sx={{
							alignItems: "center",
							gap: 0.5,
							mb: 1,
						}}
					>
						<PlaceIcon
							sx={{
								fontSize: 16,
								color: "#9ca3af",
							}}
						/>

						<Typography
							variant="body2"
							sx={{
								color: "#6b7280",
								textAlign: "left",
							}}
						>
							{activity.location}
						</Typography>
					</Stack>
				)}

				{/* Time */}
				{(activity.startTime || activity.endTime) && (
					<Stack
						direction="row"
						sx={{
							alignItems: "center",
							gap: 0.5,
						}}
					>
						<AccessTimeIcon
							sx={{
								fontSize: 16,
								color: PURPLE,
							}}
						/>

						<Typography
							variant="body2"
							sx={{
								color: "#7c3aed",
								fontWeight: 600,
								fontSize: "0.85rem",
								textAlign: "left",
							}}
						>
							{formatTime(activity.startTime)}
							{activity.endTime &&
								` – ${formatTime(activity.endTime)}`}
						</Typography>
					</Stack>
				)}
			</CardContent>
		</Card>
	);
}

// ── Activity skeleton ─────────────────────────────────────────────────────────
function ActivitySkeleton() {
	return (
		<Card
			elevation={0}
			sx={{ border: "1px solid #e8e8e8", borderRadius: 3, mb: 2 }}
		>
			<CardContent sx={{ p: 3 }}>
				<Skeleton
					width={80}
					height={22}
					sx={{ mb: 1, borderRadius: 1 }}
				/>
				<Skeleton width="55%" height={24} sx={{ mb: 0.5 }} />
				<Skeleton width="40%" height={18} />
			</CardContent>
		</Card>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Itinerary({ trip, onNav }) {
	const [activities, setActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeDate, setActiveDate] = useState<string | null>(null);
	const dateRefs = useRef<Record<string, HTMLElement | null>>({});

	const dates = trip ? getDatesInRange(trip.startDate, trip.endDate) : [];

	useEffect(() => {
		console.log("📡 Calling:", `/itinerary/trip/${trip?.id}`);
		if (!trip) return;
		const start = Date.now();

		API.get(`/itinerary/trip/${trip.id}`)
			.then(async (res) => {
				const itineraries = res.data;
				console.log("✅ Itineraries:", itineraries);

				if (!itineraries || itineraries.length === 0) {
					console.warn("⚠️ No itineraries for trip", trip.id);
					return;
				}

				const results = await Promise.allSettled(
					itineraries.map((itin: any) => {
						console.log(
							`📅 Fetching activities for itinerary ${itin.id}`,
						);
						return API.get(`/activities/itinerary/${itin.id}`)
							.then((r: any) => ({
								date: itin.date,
								activities: r.data,
							}))
							.catch((err: any) => {
								console.error(
									`❌ itinerary ${itin.id} failed:`,
									err.response?.status,
								);
								return { date: itin.date, activities: [] };
							});
					}),
				);

				const allActivities = results.flatMap((r: any) =>
					r.status === "fulfilled"
						? r.value.activities.map((a: any) => ({
								...a,
								date: r.value.date,
							}))
						: [],
				);

				// console.log("🗂️ All activities:", allActivities);
				setActivities(allActivities);
			})
			.catch((err) => {
				console.error(
					"❌ Itinerary fetch failed:",
					err.response?.status,
					err.message,
				);
				setActivities([]);
			})
			.finally(() => {
				const elapsed = Date.now() - start;
				setTimeout(
					() => {
						setLoading(false);
						setActiveDate(dates[0] ?? null);
					},
					Math.max(0, 800 - elapsed),
				);
			});
	}, [trip]);

	// Group activities by date
	const byDate = activities.reduce<Record<string, any[]>>((acc, a) => {
		const d = a.date ?? "unscheduled";
		if (!acc[d]) acc[d] = [];
		acc[d].push(a);
		return acc;
	}, {});

	// Sort activities within each day by startTime
	Object.values(byDate).forEach((arr) =>
		arr.sort((a, b) =>
			(a.startTime ?? "").localeCompare(b.startTime ?? ""),
		),
	);

	const scrollToDate = (date) => {
		setActiveDate(date);
		dateRefs.current[date]?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	if (!trip) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "calc(100svh - 64px)",
				}}
			>
				<Typography sx={{ color: "#9ca3af" }}>
					No trip selected.
				</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: "calc(100svh - 64px)",
				backgroundColor: BG,
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Header */}
			<Box
				sx={{
					backgroundColor: "#fff",
					borderBottom: "1px solid #e8e8e8",
				}}
			>
				<Box
					sx={{
						maxWidth: 900,
						mx: "auto",
						px: { xs: 2, md: 4 },
						pt: 3,
						pb: 0,
					}}
				>
					{/* Back + title row */}
					<Stack
						sx={{ 
							direction: "row",
							alignItems: "center",
							gap: 1.5,
						}}
					>
						<IconButton
							size="small"
							onClick={() => onNav("trips")}
							sx={{
								color: "#6b7280",
								"&:hover": { color: PURPLE },
							}}
						>
							<ArrowBackIcon fontSize="small" />
						</IconButton>
						<Box>
							<Typography
								variant="h5"
								sx={{
									fontWeight: 800,
									color: "#1a1a1a",
									fontFamily: "Georgia, serif",
									lineHeight: 1.2,
								}}
							>
								{trip.name}
							</Typography>
							<Typography
								variant="body2"
								sx={{ color: "#7c3aed", fontWeight: 600 }}
							>
								{trip.destination}
							</Typography>
						</Box>
					</Stack>

					{/* Date tabs */}
					<Box
						sx={{
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 0,
							scrollbarWidth: "none",
							"&::-webkit-scrollbar": { display: "none" },
						}}
					>
						{dates.map((date) => {
							const { day, date: dateLabel } =
								formatTabDate(date);
							const isActive = activeDate === date;
							const hasActivities =
								(byDate[date]?.length ?? 0) > 0;
							return (
								<Box
									key={date}
									onClick={() => scrollToDate(date)}
									sx={{
										flexShrink: 0,
										cursor: "pointer",
										px: 2,
										py: 1,
										borderRadius: "8px 8px 0 0",
										textAlign: "center",
										minWidth: 72,
										borderBottom: isActive
											? `3px solid ${PURPLE}`
											: "3px solid transparent",
										backgroundColor: isActive
											? "rgba(208,191,255,0.12)"
											: "transparent",
										transition: "all 0.15s",
										"&:hover": {
											backgroundColor:
												"rgba(208,191,255,0.1)",
										},
									}}
								>
									<Typography
										variant="caption"
										sx={{
											display: "block",
											color: isActive
												? "#7c3aed"
												: "#9ca3af",
											fontWeight: 600,
											textTransform: "uppercase",
											fontSize: "0.65rem",
										}}
									>
										{day}
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: isActive
												? "#7c3aed"
												: "#4b5563",
											fontWeight: isActive ? 700 : 500,
											fontSize: "0.8rem",
										}}
									>
										{dateLabel}
									</Typography>
									{hasActivities && !loading && (
										<Box
											sx={{
												width: 5,
												height: 5,
												borderRadius: "50%",
												backgroundColor: isActive
													? PURPLE
													: "#d1d5db",
												mx: "auto",
												mt: 0.5,
											}}
										/>
									)}
								</Box>
							);
						})}
					</Box>
				</Box>
			</Box>

			{/* Activities */}
			<Box
				sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 4 }, py: 3 }}
			>
				<Box sx={{ maxWidth: 900, mx: "auto" }}>
					{loading ? (
						<>
							{[1, 2, 3].map((n) => (
								<ActivitySkeleton key={n} />
							))}
						</>
					) : (
						dates.map((date) => {
							const { day, date: dateLabel } =
								formatTabDate(date);
							const dayActivities = byDate[date] ?? [];
							return (
								<Box
									key={date}
									ref={(el) => { dateRefs.current[date] = el as HTMLElement | null; }}
									sx={{ mb: 4, scrollMarginTop: 20 }}
								>
									{/* Day heading */}
									<Stack
										sx={{ 
											gap: 2,
											direction: "row",
											alignItems: "center"
										}}
									>
										<Box
											sx={{
												textAlign: "center",
												minWidth: 44,
												px: 1,
												py: 0.5,
												borderRadius: 2,
												backgroundColor:
													"rgba(208,191,255,0.2)",
											}}
										>
											<Typography
												variant="caption"
												sx={{
													display: "block",
													color: "#7c3aed",
													fontWeight: 700,
													textTransform: "uppercase",
													fontSize: "0.6rem",
												}}
											>
												{day}
											</Typography>
											<Typography
												variant="body2"
												sx={{
													color: "#7c3aed",
													fontWeight: 800,
													fontSize: "0.9rem",
													lineHeight: 1,
												}}
											>
												{dateLabel.split(" ")[1]}
											</Typography>
										</Box>
										<Divider sx={{ flex: 1 }} />
										<Typography
											variant="caption"
											sx={{
												color: "#9ca3af",
												flexShrink: 0,
											}}
										>
											{dayActivities.length === 0
												? "Nothing planned"
												: `${dayActivities.length} ${dayActivities.length === 1 ? "activity" : "activities"}`}
										</Typography>
									</Stack>

									{dayActivities.length === 0 ? (
										<Box
											sx={{
												py: 3,
												textAlign: "center",
												border: "1px dashed #e5e7eb",
												borderRadius: 3,
												color: "#d1d5db",
											}}
										>
											<Typography variant="body2">
												No activities added yet
											</Typography>
										</Box>
									) : (
										dayActivities.map((a) => (
											<ActivityCard
												key={a.id}
												activity={a}
											/>
										))
									)}
								</Box>
							);
						})
					)}
				</Box>
			</Box>
		</Box>
	);
}