"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

type SizeItem = { _id: string; size: string; qty: number };
type SubProduct = { sizes?: SizeItem[] };
type Product = { _id: string; name: string; subProducts?: SubProduct[] };

type OutOfStockProductsProps =
  | { data: Product[] } // array directly
  | { data: { outOfStockProducts: Product[] } }; // or object with array inside

const OutOfStockProducts = (props: OutOfStockProductsProps) => {
  // Normalize incoming data
  const products: Product[] = Array.isArray((props as any).data)
    ? ((props as any).data as Product[])
    : ((props as any).data?.outOfStockProducts ?? []);

  // Extract rows
  const outOfStockData = useMemo(() => {
    const rows: { id: string; productName: string; size: string; qty: number }[] = [];
    if (!Array.isArray(products)) return rows;

    for (const product of products) {
      const subs = product?.subProducts ?? [];
      for (const sub of subs) {
        const sizes = sub?.sizes ?? [];
        for (const s of sizes) {
          if (s && typeof s.qty === "number" && s.qty < 1) {
            rows.push({
              id: s._id,
              productName: product.name,
              size: s.size,
              qty: s.qty,
            });
          }
        }
      }
    }
    return rows;
  }, [products]);

  // Table state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter by search
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return outOfStockData.filter((item) => item.productName.toLowerCase().includes(q));
  }, [outOfStockData, search]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const start = filteredData.length ? (page - 1) * rowsPerPage + 1 : 0;
  const end = Math.min(page * rowsPerPage, filteredData.length);
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="w-full">
      {/* Header with search + rows per page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <div className="titleStyle text-lg font-semibold text-gray-800">
            Out of Stock Products
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3">
          <input
            type="text"
            placeholder="Search product..."
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
                  Product Name
                </TableCell>
                <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b">
                  Size
                </TableCell>
                <TableCell className="text-xs font-semibold uppercase text-gray-600 border-b">
                  Stock Quantity
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-sm text-gray-700">{item.productName}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-800">{item.size}</TableCell>
                    <TableCell className="text-sm text-red-600 font-semibold">{item.qty}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-6 text-sm">
                    No out of stock products found
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
          Showing {start}–{end} of {filteredData.length} results
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

          <span className="px-3 py-1 rounded bg-emerald-500 text-white text-sm">{page}</span>

          <button
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded ${
              page >= totalPages || totalPages === 0
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

export default OutOfStockProducts;
