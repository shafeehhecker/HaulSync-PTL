import { useState, useEffect } from "react";
import {
  CheckSquare,
  Camera,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  Spinner,
  EmptyState,
  Btn,
  Modal,
  FormField,
} from "../../components/common";
import api from "../../api/client";

const MOCK = [
  {
    id: "1",
    awb: "AWB-PTL-20250411",
    consignee: "Reliance Retail, Mumbai",
    deliveredAt: "2025-04-11 14:32",
    receivedBy: "Ankit Sharma",
    podStatus: "VERIFIED",
    hasPhoto: true,
    hasSignature: true,
    remarks: "",
    vendor: "Delhivery",
  },
  {
    id: "2",
    awb: "AWB-PTL-20250410",
    consignee: "Amazon FC, Pune",
    deliveredAt: "2025-04-10 11:15",
    receivedBy: "Priya Mehta",
    podStatus: "CAPTURED",
    hasPhoto: true,
    hasSignature: false,
    remarks: "Box slightly dented, contents intact",
    vendor: "BlueDart",
  },
  {
    id: "3",
    awb: "AWB-PTL-20250409",
    consignee: "Flipkart WH, Delhi",
    deliveredAt: null,
    receivedBy: null,
    podStatus: "PENDING_POD",
    hasPhoto: false,
    hasSignature: false,
    remarks: "",
    vendor: "Xpressbees",
  },
  {
    id: "4",
    awb: "AWB-PTL-20250408",
    consignee: "DTDC Hub, Chennai",
    deliveredAt: null,
    receivedBy: null,
    podStatus: "PENDING_POD",
    hasPhoto: false,
    hasSignature: false,
    remarks: "",
    vendor: "DTDC",
  },
  {
    id: "5",
    awb: "AWB-PTL-20250407",
    consignee: "Snapdeal FC, Mumbai",
    deliveredAt: "2025-04-07 16:44",
    receivedBy: "Rohit Verma",
    podStatus: "VERIFIED",
    hasPhoto: true,
    hasSignature: true,
    remarks: "",
    vendor: "Ecom Express",
  },
  {
    id: "6",
    awb: "AWB-PTL-20250406",
    consignee: "BigBasket DC, Hyderabad",
    deliveredAt: "2025-04-06 09:21",
    receivedBy: null,
    podStatus: "CAPTURED",
    hasPhoto: true,
    hasSignature: false,
    remarks: "Signature pending — recipient out of office",
    vendor: "Shadowfax",
  },
];

const STATUSES = ["ALL", "PENDING_POD", "CAPTURED", "VERIFIED"];

export default function ePODPage() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [captureModal, setCaptureModal] = useState(null);
  const [captureForm, setCaptureForm] = useState({
    receivedBy: "",
    remarks: "",
    hasPhoto: false,
    hasSignature: false,
  });

  useEffect(() => {
    api
      .get("/ptl/epod")
      .then((r) =>
        setPods(Array.isArray(r.data) ? r.data : (r.data?.data ?? [])),
      )
      .catch(() => setPods(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = pods.filter((p) => {
    const matchFilter = filter === "ALL" || p.podStatus === filter;
    const matchSearch =
      !search ||
      p.awb.includes(search.toUpperCase()) ||
      p.consignee.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCapture = () => {
    setPods((prev) =>
      prev.map((p) =>
        p.id === captureModal.id
          ? {
              ...p,
              receivedBy: captureForm.receivedBy,
              remarks: captureForm.remarks,
              hasPhoto: captureForm.hasPhoto,
              hasSignature: captureForm.hasSignature,
              deliveredAt: new Date()
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
              podStatus: "CAPTURED",
            }
          : p,
      ),
    );
    setCaptureModal(null);
    setCaptureForm({
      receivedBy: "",
      remarks: "",
      hasPhoto: false,
      hasSignature: false,
    });
  };

  const verify = (id) =>
    setPods((prev) =>
      prev.map((p) => (p.id === id ? { ...p, podStatus: "VERIFIED" } : p)),
    );

  const statusIcon = (status) => {
    if (status === "VERIFIED")
      return <CheckCircle size={15} className="text-green-400" />;
    if (status === "CAPTURED")
      return <Clock size={15} className="text-amber-400" />;
    return <AlertCircle size={15} className="text-zinc-500" />;
  };

  if (loading) return <Spinner />;

  const verified = pods.filter((p) => p.podStatus === "VERIFIED").length;
  const captured = pods.filter((p) => p.podStatus === "CAPTURED").length;
  const pending = pods.filter((p) => p.podStatus === "PENDING_POD").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ePOD Management"
        subtitle="Digital proof of delivery — capture, verify, and audit"
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 border-l-2 border-l-green-500">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Verified
          </p>
          <p className="font-display text-2xl font-bold text-green-400 mt-1">
            {verified}
          </p>
        </div>
        <div className="card p-4 border-l-2 border-l-amber-500">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Captured — Pending Verify
          </p>
          <p className="font-display text-2xl font-bold text-amber-400 mt-1">
            {captured}
          </p>
        </div>
        <div className="card p-4 border-l-2 border-l-zinc-600">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            POD Pending
          </p>
          <p className="font-display text-2xl font-bold text-zinc-400 mt-1">
            {pending}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search AWB or consignee…"
            className="input-field pl-8"
          />
        </div>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "text-zinc-400 border-zinc-700 hover:border-zinc-600"}`}
          >
            {s.replace("_", " ")}{" "}
            {s !== "ALL" && `(${pods.filter((p) => p.podStatus === s).length})`}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-zinc-800/60">
        {filtered.length === 0 && (
          <EmptyState
            icon={CheckSquare}
            title="No records found"
            description="Adjust filters or capture ePOD for delivered shipments"
          />
        )}
        {filtered.map((pod) => (
          <div key={pod.id} className="flex items-start gap-4 px-5 py-4">
            <div className="mt-0.5">{statusIcon(pod.podStatus)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-mono text-sm text-indigo-400">{pod.awb}</p>
                <StatusBadge status={pod.podStatus} />
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{pod.consignee}</p>
              {pod.deliveredAt && (
                <p className="text-xs text-zinc-500 mt-1">
                  Delivered {pod.deliveredAt}
                  {pod.receivedBy && (
                    <>
                      {" "}
                      · Received by{" "}
                      <span className="text-zinc-300">{pod.receivedBy}</span>
                    </>
                  )}
                </p>
              )}
              {pod.remarks && (
                <p className="text-xs text-amber-400/80 mt-1 italic">
                  "{pod.remarks}"
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`flex items-center gap-1 text-[11px] ${pod.hasPhoto ? "text-green-400" : "text-zinc-600"}`}
                >
                  <Camera size={11} /> Photo {pod.hasPhoto ? "✓" : "—"}
                </span>
                <span
                  className={`flex items-center gap-1 text-[11px] ${pod.hasSignature ? "text-green-400" : "text-zinc-600"}`}
                >
                  <FileText size={11} /> Signature{" "}
                  {pod.hasSignature ? "✓" : "—"}
                </span>
                <span className="text-[11px] text-zinc-600">{pod.vendor}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {pod.podStatus === "PENDING_POD" && (
                <Btn
                  size="sm"
                  onClick={() => {
                    setCaptureModal(pod);
                    setCaptureForm({
                      receivedBy: "",
                      remarks: "",
                      hasPhoto: false,
                      hasSignature: false,
                    });
                  }}
                >
                  <Camera size={12} /> Capture ePOD
                </Btn>
              )}
              {pod.podStatus === "CAPTURED" && (
                <Btn size="sm" onClick={() => verify(pod.id)}>
                  <CheckCircle size={12} /> Verify
                </Btn>
              )}
              {pod.podStatus === "VERIFIED" && (
                <Btn variant="secondary" size="sm">
                  <FileText size={12} /> View POD
                </Btn>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!captureModal}
        onClose={() => setCaptureModal(null)}
        title="Capture ePOD"
      >
        {captureModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700">
              <p className="font-mono text-sm text-indigo-400">
                {captureModal.awb}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {captureModal.consignee}
              </p>
            </div>
            <FormField label="Received By" required>
              <input
                className="input-field"
                value={captureForm.receivedBy}
                onChange={(e) =>
                  setCaptureForm((p) => ({ ...p, receivedBy: e.target.value }))
                }
                placeholder="Name of person who received"
              />
            </FormField>
            <FormField label="Remarks">
              <textarea
                className="input-field"
                rows={3}
                value={captureForm.remarks}
                onChange={(e) =>
                  setCaptureForm((p) => ({ ...p, remarks: e.target.value }))
                }
                placeholder="Any delivery notes, damages, etc."
              />
            </FormField>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Evidence
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captureForm.hasPhoto}
                    onChange={(e) =>
                      setCaptureForm((p) => ({
                        ...p,
                        hasPhoto: e.target.checked,
                      }))
                    }
                    className="accent-indigo-500"
                  />
                  <Camera size={14} /> Photo attached
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captureForm.hasSignature}
                    onChange={(e) =>
                      setCaptureForm((p) => ({
                        ...p,
                        hasSignature: e.target.checked,
                      }))
                    }
                    className="accent-indigo-500"
                  />
                  <FileText size={14} /> Signature captured
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="secondary" onClick={() => setCaptureModal(null)}>
                Cancel
              </Btn>
              <Btn onClick={handleCapture} disabled={!captureForm.receivedBy}>
                Save ePOD
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
