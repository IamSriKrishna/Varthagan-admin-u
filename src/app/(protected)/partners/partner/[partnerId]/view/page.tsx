"use client";
import * as classes from "@/app/(protected)/partners/partner/[partnerId]/view/PartnerView.styles";
import { notificationBox, notificationText } from "@/components/customer/CustomerView/CustomerView.styles";
import InfoRow from "@/components/customer/InfoRow";
import { OrdersTable } from "@/components/orders/OrderTable";
import SectionCard from "@/components/partner/SectionCard/SectionCard";
import StatCard from "@/components/partner/StatsCard/StatCard";
import { config } from "@/config";
import { partners } from "@/constants/apiConstants";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBLoader, BBTitle } from "@/lib";
import { IOrderList, OrderApiResponse } from "@/models/IOrders";
import { IPartnerData, IPartnerProfile, IPartnerResponseView } from "@/models/IPartners";
import { Avatar, Box, Card, CardContent, Chip, Divider, Grid, Stack, SxProps, Theme, Typography } from "@mui/material";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Award,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Globe,
  Hash,
  Mail,
  MapPin,
  PencilLine,
  Percent,
  Phone,
  ShoppingBag,
  Target,
  User,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

const PartnerView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const partnerIdRaw = params?.partnerId;
  const partnerId = Array.isArray(partnerIdRaw) ? partnerIdRaw[0] : partnerIdRaw;
  const [page, setPage] = useState(0);
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const ordersRef = useRef<HTMLDivElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryParams = useMemo(() => {
    const paramsdata = new URLSearchParams();

    paramsdata.append("page", String(page + 1));
    paramsdata.append("limit", String(rowsPerPage));

    return paramsdata.toString();
  }, [page, rowsPerPage]);

  const { data: ordersData, loading: loadingOrders } = useFetch<OrderApiResponse<IOrderList[]>>({
    url: `${partners.getPartnerOrders(partnerId)}?${queryParams}`,
    baseUrl: config.orderDomain,
    options: {
      skip: !filteropen,
    },
  });

  useEffect(() => {
    if (filteropen && ordersRef.current) {
      ordersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [filteropen]);

  const { data: result, loading } = useFetch<IPartnerResponseView>({
    url: partners.getPartnerById(partnerId),
    baseUrl: config.partnerDomain,
  });
  const partner = (result?.data?.[0] ?? {}) as IPartnerData;
  const profile = (result?.data?.[0]?.profile ?? {}) as IPartnerProfile;
  const statusClassMap: Record<string, SxProps<Theme>> = {
    active: classes.statusDotActive,
    inactive: classes.statusDotInactive,
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <>
      <BBTitle
        title="View Partner"
        subtitle="view partner details and edit the partner"
        rightContent={
          <Box sx={{ display: "flex", gap: 1 }}>
            <BBButton variant="outlined" startIcon={<Filter size={18} />} onClick={() => setFilterOpen(!filteropen)}>
              {filteropen ? "Hide Order History" : "Show Order History"}
            </BBButton>
            <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
              Cancel
            </BBButton>
            <BBButton
              type="submit"
              variant="contained"
              onClick={() => router.push(`/partners/partner/${partnerId}`)}
              startIcon={<PencilLine size={16} />}
            >
              Edit Partner
            </BBButton>
          </Box>
        }
      />
      <BBLoader enabled={loading || loadingOrders} />

      <Box sx={classes.containerBox}>
        <Card sx={classes.profileCard}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 4, md: "auto" }} component="div">
                <Box sx={{ position: "relative", width: "fit-content", mx: { xs: "auto", lg: "initial" } }}>
                  <Avatar sx={classes.avatarStyle} src={profile.profile_image_url || undefined}>
                    {profile?.first_name?.[0]?.toUpperCase() || "P"}
                  </Avatar>

                  <Box sx={statusClassMap[partner?.status ?? "inactive"] || classes.statusDotInactive} />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 8 }} component="div">
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Typography variant="h4" sx={classes.headerText}>
                      {profile.first_name} {profile.last_name}
                    </Typography>

                    <Chip
                      icon={<Award size={15} style={{ color: "#f59e0b" }} />}
                      label="PARTNER"
                      size="small"
                      sx={classes.partnerChip}
                    />
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 2 }} component="div">
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <User size={18} style={{ color: "#64748b" }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                            Gender
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {(profile?.gender || "").charAt(0).toUpperCase() + (profile?.gender || "").slice(1)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 3 }} component="div">
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Hash size={18} style={{ color: "#64748b" }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                            VENDOR ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {partner?.vendor_id}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }} component="div">
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Mail size={18} style={{ color: "#64748b" }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                            EMAIL
                          </Typography>
                          <Typography variant="body2" sx={classes.emailText}>
                            {partner?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }} component="div">
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Phone size={18} style={{ color: "#64748b" }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                            PHONE
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {partner?.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} component="div">
            <StatCard
              icon={Percent}
              label="Revenue Share"
              value={`${profile.revenue_share_percent}%`}
              color="#10b981"
              bgGradient="linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)"
              trend="15%"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} component="div">
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={ordersData?.data?.meta?.total.toString() || "0"}
              color="#6366f1"
              bgGradient="linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)"
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }} component="div">
            <Box sx={classes.notificationMainBox}>
              {[
                { icon: Mail, label: "Email Notifications", value: profile?.email_notifications },
                { icon: Phone, label: "SMS Notifications", value: profile?.sms_notifications },
                { icon: Bell, label: "Push Notifications", value: profile?.push_notifications },
              ].map((item, idx) => (
                <Box key={idx} sx={notificationBox}>
                  <Box sx={notificationText}>
                    <item.icon size={18} />
                    <Typography>{item.label}</Typography>
                  </Box>
                  {item.value ? <CheckCircle size={20} color="#4caf50" /> : <XCircle size={20} color="#f44336" />}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }} component="div">
            <SectionCard
              icon={User}
              title="Personal Information"
              gradient="linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)"
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={User} label="Username" value={partner?.username} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow
                    icon={Globe}
                    label="Language"
                    value={profile?.preferred_language ? profile?.preferred_language?.toUpperCase() : ""}
                  />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={Clock} label="Timezone" value={profile.time_zone} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={profile?.date_of_birth ? dayjs(profile.date_of_birth).format("DD MMM YYYY") : ""}
                  />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={Globe} label="Region" value={profile.region ? profile.region.toUpperCase() : ""} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow
                    icon={DollarSign}
                    label="Salary"
                    value={`₹${Number(profile.salary).toLocaleString("en-IN")}`}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} component="div">
            <SectionCard
              icon={MapPin}
              title="Location Details"
              gradient="linear-gradient(135deg, #16a34a 0%, #065f46 100%)"
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={MapPin} label="Address" value={profile.address} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={MapPin} label="City" value={profile.city} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={MapPin} label="State" value={profile.state} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={Globe} label="Country" value={profile.country} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={Hash} label="Postal Code" value={profile.postal_code} />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }} component="div">
                  <InfoRow icon={Target} label="Preferred Location" value={profile.preferred_store_location} />
                </Grid>

                <Grid size={{ xs: 12 }} component="div">
                  <Box sx={{ pt: 2, px: 1 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, mb: 1, display: "block" }}>
                      ACCOUNT TIMESTAMPS
                    </Typography>

                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, lg: 6 }} component="div">
                        <InfoRow
                          icon={Calendar}
                          label="Account Created"
                          value={partner?.created_at ? dayjs(partner?.created_at).format("DD MMM YYYY, hh:mm A") : ""}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, lg: 6 }} component="div">
                        <InfoRow
                          icon={Clock}
                          label="Last Updated"
                          value={partner?.updated_at ? dayjs(partner?.updated_at).format("DD MMM YYYY, hh:mm A") : ""}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
      {filteropen && (
        <Box sx={{ my: 2 }} ref={ordersRef}>
          <BBTitle title="Order History" />

          <OrdersTable
            data={ordersData?.data?.orders ?? []}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={ordersData?.data?.meta?.total ?? 0}
            onPageChange={setPage}
            onRowsPerPageChange={(rows: number) => {
              setRowsPerPage(rows);
              setPage(0);
            }}
            action={false}
            partner={false}
          />
        </Box>
      )}
    </>
  );
};

export default PartnerView;
