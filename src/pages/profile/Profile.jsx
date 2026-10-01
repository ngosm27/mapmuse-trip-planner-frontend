import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import API from "../../api";
import homeBg from "../../assets/home-bkg.jpg";
import { PURPLE_DARK } from "../../constants";
import ManageAccount from "./ManageAccount";
import YourTrips from "./YourTrips";
import TravelPreferences from "./TravelPreferences";
import Settings from "./Settings";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [activeItem, setActiveItem] = useState("Manage Account");

    const menuItems = [
        { title: "Manage Account" },
        // { title: "Your Trips" },
        { title: "Travel Preferences" },
        { title: "Settings" },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case "Manage Account":
                return <ManageAccount profile={profile} />;
            // case "Your Trips":
            //     return <YourTrips profile={profile} />;
            case "Travel Preferences":
                return <TravelPreferences profile={profile} />;
            case "Settings":
                return <Settings profile={profile} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("travelerProfile"));
        setProfile(saved);
    }, []);

    return (
        <Box
            sx={{
                height: "calc(100svh - 64px)",
                display: "flex",
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${homeBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100%",
            }}
        >
            {/* Sidebar */}
            <Box
                sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    padding: "24px 0px 24px 0px", // ← no right padding
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    minWidth: "220px",
                    borderRadius: "12px 0 0 12px", // ← rounded on left only

                }}
            >
                {/* Profile name at top of sidebar */}
                {profile && (
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "#000",
                            mb: 2,
                            px: 1,
                        }}
                    >
                        {profile.meta?.name || "My Profile"}
                    </Typography>
                )}

                {/* Menu buttons */}
                {/* Sidebar buttons */}
                {menuItems.map((item, index) => (
                    <Button
                        key={index}
                        fullWidth
                        onClick={() => setActiveItem(item.title)}
                        sx={{
                            justifyContent: "flex-start",
                            textAlign: "left",
                            fontSize: "15px",
                            padding: "10px 16px",
                            borderRadius: "0", // ← rounded on left, flat on right
                            color: activeItem === item.title ? PURPLE_DARK : "#000",
                            backgroundColor:
                                activeItem === item.title
                                    ? "rgba(255,255,255,1)"   // ← fully white when active
                                    : "rgba(255,255,255,0.6)",
                            fontWeight: activeItem === item.title ? 700 : 400,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.9)",
                                color: PURPLE_DARK,
                            },
                        }}
                    >
                        {item.title}
                    </Button>
                    ))}
            </Box>

            {/* Main content area */}
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,1)", // ← white background
                    // borderRadius: "8px 8px 8px 0px",        // ← flat on bottom left
                    // margin: "16px 16px 16px 0",             // ← gap on all sides except left
                    padding: "32px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {renderContent()}
        
            </Box>
        </Box>
    );
}

export default Profile;