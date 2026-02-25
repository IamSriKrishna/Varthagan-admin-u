"use client";
import InfoRow from "@/components/customer/InfoRow";
import { ICustomerDetailResponse } from "@/models/ICustomer";
import { Avatar, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Globe,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";

// Import all styles
import { GOOGLE_MAPS_LINK } from "@/constants/mapConstants";
import * as classes from "./CustomerView.styles";

interface CustomerViewProps {
  results?: ICustomerDetailResponse | null;
}

const CustomerView: React.FC<CustomerViewProps> = ({ results }) => {
  return (
    <Box sx={classes.wrapper}>
      <Box sx={classes.headerBanner}>
        <Box sx={classes.headerContainer}>
          <Box sx={classes.avatarWrapper}>
            <Avatar sx={classes.avatar}>{results?.data?.first_name?.[0]?.toUpperCase() || "U"}</Avatar>
          </Box>
          <Box sx={classes.infoSection}>
            <Typography sx={classes.nameText}>
              {results?.data?.first_name || results?.data?.last_name
                ? `${results?.data?.first_name ?? ""} ${results?.data?.last_name ?? ""}`.trim()
                : "Not Provided"}
            </Typography>
            <Box sx={classes.statusBadge}>
              <Box sx={classes.statusDot(results?.data?.status ? "active" : "inactive")} />
              {results?.data?.status ? "Active" : "Inactive"}
            </Box>
          </Box>
        </Box>
      </Box>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card sx={classes.card}>
            <CardContent sx={classes.cardContent}>
              <Typography sx={classes.sectionHeading}>
                <User size={20} /> Contact Information
              </Typography>
              <InfoRow icon={User} label="Gender" value={results?.data?.gender} />
              <InfoRow
                icon={Phone}
                label="Phone Number"
                value={results?.data?.phone}
                action={results?.data?.phone_verified && <CheckCircle size={18} color="#4caf50" />}
              />
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={results?.data?.email || "Not provided"}
                action={results?.data?.email_verified && <CheckCircle size={18} color="#4caf50" />}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value="Get Location"
                onClick={() =>
                  window.open(`${GOOGLE_MAPS_LINK}${results?.data.latitude},${results?.data.longitude}`, "_blank")
                }
              />
              <InfoRow
                icon={Globe}
                label="Preferred Language"
                value={results?.data?.preferred_language?.toUpperCase() || "-"}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Membership Details */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card sx={classes.card}>
            <CardContent sx={classes.cardContent}>
              <Typography sx={classes.sectionHeading}>
                <CreditCard size={20} /> Membership Details
              </Typography>
              <InfoRow icon={Hash} label="Member Number" value={results?.data?.member_no} />
              <InfoRow
                icon={CreditCard}
                label="Membership Status"
                value={results?.data?.membership_active ? "Active" : "Inactive"}
              />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={dayjs(results?.data?.member_since).format("DD MMM YYYY, hh:mm A")}
              />
              <InfoRow
                icon={Calendar}
                label="Membership Expiry"
                value={dayjs(results?.data?.member_expiry).format("DD MMM YYYY, hh:mm A")}
              />
              <InfoRow icon={DollarSign} label="Preferred Currency" value={results?.data?.preferred_currency} />
            </CardContent>
          </Card>
        </Grid>

        {/* Account Activity */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card sx={classes.card}>
            <CardContent sx={classes.cardContent}>
              <Typography sx={classes.sectionHeading}>
                <ShoppingBag size={20} /> Account Activity
              </Typography>
              <InfoRow icon={ShoppingBag} label="Total Orders" value={results?.data?.order_count} />
              <InfoRow
                icon={Calendar}
                label="Last Login"
                value={dayjs(results?.data?.last_login_at).format("DD MMM YYYY, hh:mm A")}
              />
              <InfoRow icon={Hash} label="Referral Code" value={results?.data?.referral_code} />
              <InfoRow
                icon={Calendar}
                label="Account Created"
                value={dayjs(results?.data?.created_at).format("DD MMM YYYY, hh:mm A")}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Card sx={classes.card}>
            <CardContent sx={classes.cardContent}>
              <Typography sx={classes.sectionHeading}>
                <Bell size={20} /> Notification Preferences
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 } }}>
                {[
                  { icon: Mail, label: "Email Notifications", value: results?.data?.email_notifications },
                  { icon: Phone, label: "SMS Notifications", value: results?.data?.sms_notifications },
                  { icon: Bell, label: "Push Notifications", value: results?.data?.push_notifications },
                ].map((item, idx) => (
                  <Box key={idx} sx={classes.notificationBox}>
                    <Box sx={classes.notificationText}>
                      <item.icon size={18} />
                      <Typography>{item.label}</Typography>
                    </Box>
                    {item.value ? <CheckCircle size={20} color="#4caf50" /> : <XCircle size={20} color="#f44336" />}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerView;
