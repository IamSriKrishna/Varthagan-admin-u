"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@mui/material";
import {
  Box, Button, Stack, Typography, IconButton,
  Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
} from "@mui/material";
import {
  Plus, Edit, Trash2, Eye, Package2, Layers,
  CalendarDays, Activity, ChevronRight,
  Zap, Sparkles, BarChart3, AlertTriangle,
} from "lucide-react";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { showToastMessage } from "@/utils/toastUtil";
import { ProductGroupListOutput, ProductGroupListResponse } from "@/models/product-group.model";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  // Backgrounds
  pageBg:       "#F8F6F1",
  cardBg:       "#FFFFFF",
  cardAlt:      "#FDFCF9",
  surfaceMid:   "#F2EFE9",
  glass:        "rgba(255,253,248,0.92)",

  // Accent — warm coral
  accent:       "#D4521A",
  accentMid:    "#E8754A",
  accentSoft:   "#FDEEE7",
  accentXSoft:  "#FEF6F2",
  accentGlow:   "rgba(212,82,26,0.15)",

  // Greens
  green:        "#2A7A4B",
  greenSoft:    "#E8F5EE",
  greenMid:     "#6EC994",

  // Ambers
  amber:        "#B45309",
  amberSoft:    "#FEF3E2",

  // Blues
  blue:         "#1B5FA8",
  blueSoft:     "#E8F0FA",

  // Text
  ink:          "#1A1208",
  inkMid:       "#3D3320",
  inkLight:     "#7A6E5F",
  inkXLight:    "#B5A898",
  inkGhost:     "#E2DBD0",

  // Borders
  border:       "#E8E2D8",
  borderMid:    "#C9C0B4",

  // Shadows
  shadow:       "0 1px 3px rgba(26,18,8,0.06)",
  shadowSm:     "0 2px 10px rgba(26,18,8,0.06), 0 1px 3px rgba(26,18,8,0.04)",
  shadowMd:     "0 6px 24px rgba(26,18,8,0.09), 0 2px 8px rgba(26,18,8,0.05)",
  shadowLg:     "0 16px 48px rgba(26,18,8,0.12), 0 4px 14px rgba(26,18,8,0.07)",
  shadowAccent: "0 4px 20px rgba(212,82,26,0.25)",
  shadowAccentHover: "0 8px 32px rgba(212,82,26,0.38)",
};

// ─── Avatar palette ────────────────────────────────────────────────────────────
function colorFromString(str: string) {
  const palette = [
    { bg: "#FDEEE7", fg: "#D4521A", border: "#F5C4AE" },
    { bg: "#E8F5EE", fg: "#2A7A4B", border: "#A8DFC0" },
    { bg: "#E8F0FA", fg: "#1B5FA8", border: "#A8C4E8" },
    { bg: "#F3E8FE", fg: "#7C3AED", border: "#D4B0FC" },
    { bg: "#FEF3E2", fg: "#B45309", border: "#F0CFA0" },
    { bg: "#FDE8EF", fg: "#C4335A", border: "#F0A8BC" },
    { bg: "#E8F8F8", fg: "#0E7490", border: "#A8DDE0" },
    { bg: "#F0F0FE", fg: "#4338CA", border: "#B8B8F8" },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Group Avatar ──────────────────────────────────────────────────────────────
function GroupAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const { bg, fg, border } = colorFromString(name);
  return (
    <Box
      sx={{
        width: 48, height: 48, borderRadius: "15px", flexShrink: 0,
        background: bg,
        border: `1.5px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 2px 8px ${fg}20`,
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
        "&:hover": { transform: "scale(1.1) rotate(-4deg)", boxShadow: `0 6px 18px ${fg}35` },
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          fontSize: "0.82rem",
          color: fg,
          letterSpacing: "0.04em",
        }}
      >
        {initials}
      </Typography>
    </Box>
  );
}

// ─── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ active }: { active: boolean }) {
  return (
    <Box
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.6,
        px: 1.2, py: 0.4, borderRadius: "20px",
        background: active ? T.greenSoft : T.surfaceMid,
        border: `1.5px solid ${active ? "#A8DFC0" : T.border}`,
      }}
    >
      <Box
        sx={{
          width: 5.5, height: 5.5, borderRadius: "50%",
          background: active ? T.green : T.inkXLight,
          boxShadow: active ? `0 0 0 3px ${T.green}25` : "none",
          animation: active ? "heartbeat 2.2s ease-in-out infinite" : "none",
          "@keyframes heartbeat": {
            "0%, 100%": { transform: "scale(1)", opacity: 1 },
            "50%": { transform: "scale(1.4)", opacity: 0.6 },
          },
        }}
      />
      <Typography
        sx={{
          fontSize: "0.67rem",
          fontWeight: 700,
          color: active ? T.green : T.inkLight,
          fontFamily: "'Instrument Sans', sans-serif",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {active ? "Active" : "Inactive"}
      </Typography>
    </Box>
  );
}

// ─── Stat Pill inside card ─────────────────────────────────────────────────────
function StatPill({
  icon: Icon, label, value, color, bg,
}: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 1.25,
        px: 1.75, py: 1.1,
        background: bg,
        borderRadius: "10px",
        border: `1.5px solid ${color}20`,
        transition: "transform 0.18s",
        "&:hover": { transform: "translateY(-1.5px)" },
      }}
    >
      <Box sx={{ p: 0.5, borderRadius: "6px", background: `${color}18`, flexShrink: 0 }}>
        <Icon size={11} color={color} strokeWidth={2.5} />
      </Box>
      <Box>
        <Typography sx={{ color: T.inkXLight, fontWeight: 700, fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, color: T.inkMid, fontSize: "0.82rem", fontFamily: "'Fraunces', Georgia, serif", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({
  group, index, onView, onEdit, onDelete,
}: {
  group: ProductGroupListOutput; index: number;
  onView: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { fg } = colorFromString(group.name);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        background: T.cardBg,
        border: `1.5px solid ${hovered ? T.borderMid : T.border}`,
        borderRadius: "22px",
        boxShadow: hovered ? T.shadowMd : T.shadowSm,
        overflow: "hidden",
        transition: "all 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: hovered ? "translateY(-3px)" : "none",
        position: "relative",
        animation: `slideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms both`,
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        // Left accent stripe
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0, top: "20%", bottom: "20%",
          width: "3px",
          background: hovered
            ? `linear-gradient(180deg, ${fg}, ${fg}60)`
            : "transparent",
          borderRadius: "0 3px 3px 0",
          transition: "all 0.25s",
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>

          {/* Left: avatar + info */}
          <Stack direction="row" spacing={2} alignItems="flex-start" flex={1} minWidth={0}>
            <GroupAvatar name={group.name} />
            <Box flex={1} minWidth={0}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.6} flexWrap="wrap" gap={0.75}>
                <Typography
                  sx={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 700,
                    color: T.ink,
                    fontSize: "1rem",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {group.name}
                </Typography>
                <StatusPill active={group.is_active} />
              </Stack>
              <Typography
                sx={{
                  color: group.description ? T.inkLight : T.inkXLight,
                  fontSize: "0.815rem",
                  lineHeight: 1.65,
                  fontStyle: group.description ? "normal" : "italic",
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
              >
                {group.description || "No description provided"}
              </Typography>
            </Box>
          </Stack>

          {/* Right: Action buttons */}
          <Stack
            direction="row" spacing={0.5}
            sx={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(10px)",
              transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
              flexShrink: 0,
            }}
          >
            {[
              {
                icon: Eye, title: "View",
                style: { color: T.inkLight, bg: T.surfaceMid, border: T.border, hoverBg: T.blueSoft, hoverColor: T.blue, hoverBorder: "#A8C4E8" },
                action: onView,
              },
              {
                icon: Edit, title: "Edit",
                style: { color: T.accent, bg: T.accentXSoft, border: "#F5C4AE", hoverBg: T.accentSoft, hoverColor: T.accent, hoverBorder: T.accentMid },
                action: onEdit,
              },
              {
                icon: Trash2, title: "Delete",
                style: { color: "#C4335A", bg: "#FDE8EF", border: "#F0A8BC", hoverBg: "#FDD0DE", hoverColor: "#C4335A", hoverBorder: "#E0748C" },
                action: onDelete,
              },
            ].map(({ icon: Icon, title, style, action }) => (
              <Tooltip key={title} title={title} placement="top" arrow>
                <IconButton
                  size="small"
                  onClick={action}
                  sx={{
                    color: style.color,
                    background: style.bg,
                    border: `1.5px solid ${style.border}`,
                    borderRadius: "10px",
                    width: 33, height: 33,
                    "&:hover": {
                      background: style.hoverBg,
                      color: style.hoverColor,
                      borderColor: style.hoverBorder,
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.16s",
                  }}
                >
                  <Icon size={14} />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Subtle divider */}
      <Box
        sx={{
          mx: 3, height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${T.border} 30%, ${T.border} 70%, transparent 100%)`,
        }}
      />

      {/* Stats + View CTA */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <StatPill icon={Layers} label="Components" value={group.components?.length ?? 0} color={T.accent} bg={T.accentXSoft} />
          <StatPill
            icon={Activity}
            label="Status"
            value={group.is_active ? "Active" : "Inactive"}
            color={group.is_active ? T.green : T.inkLight}
            bg={group.is_active ? T.greenSoft : T.surfaceMid}
          />
          <StatPill
            icon={CalendarDays}
            label="Created"
            value={new Date(group.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            color={T.amber}
            bg={T.amberSoft}
          />

          {/* Spacer */}
          <Box flex={1} />

          {/* View details */}
          <Box
            onClick={onView}
            sx={{
              display: "flex", alignItems: "center", gap: 0.75,
              cursor: "pointer",
              px: 1.75, py: 1,
              borderRadius: "10px",
              background: hovered ? T.accentXSoft : T.surfaceMid,
              border: `1.5px solid ${hovered ? "#F5C4AE" : T.border}`,
              transition: "all 0.2s",
              "&:hover": { background: T.accentSoft },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: hovered ? T.accent : T.inkLight,
                fontFamily: "'Instrument Sans', sans-serif",
                transition: "color 0.2s",
              }}
            >
              View details
            </Typography>
            <ChevronRight
              size={13}
              color={hovered ? T.accent : T.inkXLight}
              style={{
                transition: "transform 0.2s, color 0.2s",
                transform: hovered ? "translateX(3px)" : "none",
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

// ─── Summary Stat Card ─────────────────────────────────────────────────────────
function SummaryCard({
  label, value, sub, icon: Icon, accent, delay,
}: { label: string; value: number; sub: string; icon: any; accent: string; delay: number }) {
  return (
    <Box
      sx={{
        flex: 1, minWidth: 140,
        px: 2.5, py: 2.5,
        background: T.cardBg,
        border: `1.5px solid ${T.border}`,
        borderRadius: "18px",
        boxShadow: T.shadowSm,
        position: "relative", overflow: "hidden",
        animation: `slideUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(14px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: T.shadowMd,
          borderColor: `${accent}40`,
        },
        // Decorative corner blob
        "&::after": {
          content: '""',
          position: "absolute",
          top: -18, right: -18,
          width: 72, height: 72,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        },
      }}
    >
      <Box
        sx={{
          display: "inline-flex", p: 1, mb: 1.75, borderRadius: "10px",
          background: `${accent}15`,
          border: `1.5px solid ${accent}25`,
        }}
      >
        <Icon size={15} color={accent} strokeWidth={2.5} />
      </Box>
      <Typography
        sx={{
          color: T.inkXLight,
          fontWeight: 700,
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          mb: 0.5,
          fontFamily: "'Instrument Sans', sans-serif",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 700,
          color: T.ink,
          fontSize: "1.6rem",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          mb: 0.4,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ color: T.inkLight, fontSize: "0.7rem", fontFamily: "'Instrument Sans', sans-serif" }}>
        {sub}
      </Typography>
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductGroupsPage() {
  const router = useRouter();
  const { mutateApi: deleteProductGroup } = useApi<any>("", "DELETE");
  const [productGroups, setProductGroups] = useState<ProductGroupListOutput[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: fetchedData, loading: isLoading } = useFetch<ProductGroupListResponse>({
    url: "/product-groups",
  });

  useEffect(() => {
    if (fetchedData?.data) setProductGroups(fetchedData.data);
  }, [fetchedData]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      setDeleteLoading(true);
      const response = await deleteProductGroup(undefined, `/product-groups/${selectedId}`);
      if (response?.success || response?.message) {
        setProductGroups(productGroups.filter((pg) => pg.id !== selectedId));
        showToastMessage("Product group deleted successfully", "success");
        setOpenDeleteDialog(false);
        setSelectedId(null);
      }
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error.message as string)
          : "Failed to delete product group";
      showToastMessage(errorMessage, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalGroups = productGroups.length;
  const activeGroups = productGroups.filter((g) => g.is_active).length;
  const totalComponents = productGroups.reduce((acc, g) => acc + (g.components?.length ?? 0), 0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: T.pageBg,
        pb: 10,
        fontFamily: "'Instrument Sans', 'Plus Jakarta Sans', sans-serif",
        // Subtle linen texture
        backgroundImage: `
          radial-gradient(${T.inkGhost}80 0.8px, transparent 0.8px)
        `,
        backgroundSize: "22px 22px",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      {/* ── Sticky Header ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: T.glass,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1.5px solid ${T.border}`,
          px: { xs: 2.5, md: 4.5 },
          py: 2.25,
          position: "sticky", top: 0, zIndex: 20,
          boxShadow: "0 1px 0 #E8E2D8, 0 4px 24px rgba(26,18,8,0.04)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2.25}>
            {/* Icon mark */}
            <Box
              sx={{
                width: 44, height: 44, borderRadius: "14px",
                background: `linear-gradient(145deg, ${T.accent} 0%, #B83A0C 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: T.shadowAccent, position: "relative", overflow: "hidden",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                "&:hover": { transform: "rotate(-6deg) scale(1.08)", boxShadow: T.shadowAccentHover },
                "&::before": {
                  content: '""', position: "absolute",
                  bottom: -8, right: -8, width: 28, height: 28,
                  borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <Package2 size={20} color="#FFF8F4" />
            </Box>

            <Box>
              <Stack direction="row" alignItems="baseline" spacing={1.25}>
                <Typography
                  sx={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 700,
                    color: T.ink,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Product Groups
                </Typography>
                {/* Count badge */}
                <Box
                  sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.35,
                    px: 0.8, py: 0.2, borderRadius: "5px",
                    background: T.accentXSoft,
                    border: `1.5px solid #F5C4AE`,
                  }}
                >
                  <Zap size={8} color={T.accent} />
                  <Typography
                    sx={{
                      fontSize: "0.63rem", fontWeight: 700, color: T.accent,
                      fontFamily: "'Fraunces', Georgia, serif",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {totalGroups}
                  </Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: T.inkLight, fontSize: "0.7rem", mt: 0.2, fontFamily: "'Instrument Sans', sans-serif" }}>
                Manage & organise product collections
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<Plus size={14} strokeWidth={2.5} />}
            onClick={() => router.push("/products/product-groups/create")}
            sx={{
              background: `linear-gradient(145deg, ${T.accent} 0%, #B83A0C 100%)`,
              borderRadius: "12px",
              textTransform: "none",
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              height: 40, px: 2.5,
              boxShadow: T.shadowAccent,
              border: "none",
              letterSpacing: "-0.01em",
              "&:hover": {
                background: `linear-gradient(145deg, ${T.accentMid}, ${T.accent})`,
                boxShadow: T.shadowAccentHover,
                transform: "translateY(-1.5px)",
              },
              transition: "all 0.18s",
            }}
          >
            Create Group
          </Button>
        </Stack>
      </Box>

      {/* ── Page Body ──────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2.5, md: 4.5 }, pt: 4 }}>

        {/* ── Loading ──────────────────────────────────────────────────────────── */}
        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 18, gap: 2.5 }}>
            <Box sx={{ position: "relative", width: 60, height: 60 }}>
              <CircularProgress
                size={60} thickness={2} variant="determinate" value={100}
                sx={{ color: T.inkGhost, position: "absolute", top: 0, left: 0 }}
              />
              <CircularProgress
                size={60} thickness={2}
                sx={{ color: T.accent, position: "absolute", top: 0, left: 0 }}
              />
            </Box>
            <Typography sx={{ color: T.inkLight, fontSize: "0.85rem", fontWeight: 600, fontFamily: "'Instrument Sans', sans-serif" }}>
              Loading product groups…
            </Typography>
          </Box>
        )}

        {/* ── Summary row ──────────────────────────────────────────────────────── */}
        {!isLoading && productGroups.length > 0 && (
          <Stack direction="row" spacing={2} mb={3.5} flexWrap="wrap" useFlexGap>
            <SummaryCard label="Total Groups" value={totalGroups} sub="in catalogue" icon={BarChart3} accent={T.accent} delay={0} />
            <SummaryCard label="Active" value={activeGroups} sub="running now" icon={Sparkles} accent={T.green} delay={70} />
            <SummaryCard label="Components" value={totalComponents} sub="across all groups" icon={Layers} accent={T.blue} delay={140} />
          </Stack>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────────── */}
        {!isLoading && productGroups.length === 0 && (
          <Box
            sx={{
              background: T.cardBg,
              borderRadius: "24px",
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadowMd,
              py: 14, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center",
              animation: "slideUp 0.5s ease both",
              "@keyframes slideUp": {
                from: { opacity: 0, transform: "translateY(16px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {/* Animated rings */}
            <Box sx={{ position: "relative", width: 96, height: 96, mb: 3.5, mx: "auto" }}>
              <Box sx={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `1.5px dashed ${T.borderMid}`,
                animation: "spin 14s linear infinite",
                "@keyframes spin": { to: { transform: "rotate(360deg)" } },
              }} />
              <Box sx={{
                position: "absolute", inset: 14, borderRadius: "50%",
                border: `1px solid ${T.border}`,
                animation: "spin 9s linear infinite reverse",
              }} />
              <Box sx={{
                position: "absolute", inset: 26, borderRadius: "50%",
                background: T.accentXSoft,
                border: `1.5px solid #F5C4AE`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Package2 size={22} color={T.accent} />
              </Box>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 700, color: T.ink, mb: 0.75,
                fontSize: "1.1rem", letterSpacing: "-0.03em",
              }}
            >
              No product groups yet
            </Typography>
            <Typography
              sx={{
                color: T.inkLight, mb: 4, fontSize: "0.875rem",
                maxWidth: 290, mx: "auto", lineHeight: 1.7,
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            >
              Create your first product group to start organising your catalogue
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={14} strokeWidth={2.5} />}
              onClick={() => router.push("/products/product-groups/create")}
              sx={{
                background: `linear-gradient(145deg, ${T.accent}, #B83A0C)`,
                borderRadius: "12px", textTransform: "none",
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 700, fontSize: "0.875rem",
                height: 44, px: 3.5,
                boxShadow: T.shadowAccent,
                "&:hover": { boxShadow: T.shadowAccentHover, transform: "translateY(-2px)" },
                transition: "all 0.18s",
              }}
            >
              Create First Group
            </Button>
          </Box>
        )}

        {/* ── Group cards ───────────────────────────────────────────────────────── */}
        {!isLoading && productGroups.length > 0 && (
          <Stack spacing={2.25}>
            {productGroups.map((group, i) => (
              <GroupCard
                key={group.id}
                group={group}
                index={i}
                onView={() => router.push(`/products/product-groups/${group.id}`)}
                onEdit={() => router.push(`/products/product-groups/${group.id}/edit`)}
                onDelete={() => { setSelectedId(group.id); setOpenDeleteDialog(true); }}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* ── Delete Dialog ──────────────────────────────────────────────────────── */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleteLoading && setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "22px",
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadowLg,
            minWidth: 390,
            overflow: "hidden",
            background: T.cardBg,
          },
        }}
      >
        <DialogTitle sx={{ px: 3.5, pt: 3, pb: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.75}>
            <Box
              sx={{
                p: 1, borderRadius: "11px",
                background: "#FDE8EF",
                border: "1.5px solid #F0A8BC",
              }}
            >
              <Trash2 size={16} color="#C4335A" />
            </Box>
            <Typography
              sx={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 700, color: T.ink,
                fontSize: "1.05rem", letterSpacing: "-0.02em",
              }}
            >
              Delete Product Group
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3.5, pt: 2.5, pb: 2 }}>
          <Box
            sx={{
              display: "flex", alignItems: "flex-start", gap: 1.5,
              p: 2, mb: 2.5, borderRadius: "12px",
              background: "#FDE8EF",
              border: "1.5px solid #F0A8BC",
            }}
          >
            <AlertTriangle size={15} color="#C4335A" style={{ flexShrink: 0, marginTop: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: "#C4335A", fontSize: "0.82rem", lineHeight: 1.55, fontFamily: "'Instrument Sans', sans-serif" }}>
              This action cannot be undone
            </Typography>
          </Box>
          <Typography sx={{ color: T.inkMid, lineHeight: 1.8, fontSize: "0.875rem", fontFamily: "'Instrument Sans', sans-serif" }}>
            The product group and all associated component links will be permanently removed. Products themselves will not be affected.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3.5, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleteLoading}
            sx={{
              borderRadius: "11px", textTransform: "none",
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700, color: T.inkLight,
              border: `1.5px solid ${T.border}`,
              px: 2.5, height: 40,
              "&:hover": { background: T.surfaceMid, borderColor: T.borderMid },
              transition: "all 0.15s",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteLoading}
            sx={{
              borderRadius: "11px", textTransform: "none",
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700, px: 2.5, height: 40,
              background: "linear-gradient(145deg, #C4335A, #9C1A40)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(196,51,90,0.32)",
              "&:hover": {
                background: "linear-gradient(145deg, #D4486E, #C4335A)",
                boxShadow: "0 6px 20px rgba(196,51,90,0.46)",
                transform: "translateY(-1px)",
              },
              "&:disabled": { opacity: 0.55 },
              transition: "all 0.18s",
            }}
          >
            {deleteLoading ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={13} sx={{ color: "#fff" }} />
                <span>Deleting…</span>
              </Stack>
            ) : "Delete Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}