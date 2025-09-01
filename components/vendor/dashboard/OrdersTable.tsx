"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { SlEye } from "react-icons/sl";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { fmtMoney } from "@/utils/currency";

type OrdersTableProps = {
  data: {
    orders: {
      _id: string;
      user?: { email?: string };
      total: number;
      isPaid: boolean;
    }[];
  };
};

const OrdersTable = ({ data }: OrdersTableProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter by search (email only for now)
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(data?.orders)) return [];
    return data.orders.filter((order: any) =>
      order?.user?.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.orders, search]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="w-full">
      {/* Header with search + rows per page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="w-full sm:w-auto text-center sm:text-left">
            <div className="titleStyle text-lg font-semibold text-gray-800">
            Recent Orders
            </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3">
            <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 w-40 sm:w-52"
            />

            <select
            value={rowsPerPage}
            onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
            }}
            className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
            <option value={10}>10 Rows</option>
            <option value={20}>20 Rows</option>
            <option value={50}>50 Rows</option>
            </select>
        </div>
        </div>


      {/* Table */}
      <div className="overflow-x-auto">
      <TableContainer component={Paper} className="shadow-sm rounded-xl">
        <Table className="min-w-full border-separate border-spacing-y-2">
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b">
                Name
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b">
                Total
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b">
                Payment
              </TableCell>
              <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b text-center">
                View
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order: any, index: number) => (
                <TableRow
                  key={order._id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-sm text-gray-700">
                    {order?.user?.email || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-800">
                    {fmtMoney(order.total)}
                  </TableCell>
                  <TableCell>
                    {order.isPaid ? (
                      <FaCheckCircle size={18} className="text-green-500" />
                    ) : (
                      <IoIosCloseCircle size={20} className="text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/order/${order._id}`}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <SlEye />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No recent orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
        </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {(page - 1) * rowsPerPage + 1}–
          {Math.min(page * rowsPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 rounded ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>

          <span className="px-3 py-1 rounded bg-emerald-500 text-white text-sm">
            {page}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded ${
              page === totalPages || totalPages === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
