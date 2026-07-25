"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { careersAPI, type JobPosting } from "@/lib/careers-api";
import websocketService from "@/lib/websocket";

interface UseCareersOptions {
  department?: string;
  search?: string;
  autoConnect?: boolean;
}

export function useCareers(options: UseCareersOptions = {}) {
  const { department, search, autoConnect = true } = options;
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadJobs = useCallback(async () => {
    try {
      const [jobsData, deptList] = await Promise.all([
        careersAPI.getJobs({
          department: department || undefined,
          search: search || undefined,
          limit: 50,
        }),
        careersAPI.getDepartments(),
      ]);

      if (!mountedRef.current) return;

      setJobs(jobsData.jobs);
      setTotal(jobsData.total);
      setDepartments(deptList);
      setError(null);
    } catch {
      if (mountedRef.current) {
        setError("Failed to load job openings");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [department, search]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    loadJobs();
    return () => {
      mountedRef.current = false;
    };
  }, [loadJobs]);

  useEffect(() => {
    if (!autoConnect) return;

    websocketService.connect();
    websocketService.emit("join-careers-feed", {});

    const handleUpdate = () => {
      loadJobs();
    };

    websocketService.on("careers-updated", handleUpdate);
    websocketService.on("careers-feed-changed", handleUpdate);

    return () => {
      websocketService.off("careers-updated", handleUpdate);
      websocketService.off("careers-feed-changed", handleUpdate);
      websocketService.emit("leave-careers-feed", {});
    };
  }, [autoConnect, loadJobs]);

  return {
    jobs,
    departments,
    total,
    loading,
    error,
    reload: loadJobs,
  };
}
