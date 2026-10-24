"use client";

import { useId } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "../actions";

type Props = { name: string; email: string; isAdmin: boolean };

export function UserMenuDropdown({ name, email, isAdmin }: Props) {
  const logoutFormId = useId();

  return (
    <>
      {/* 選單內容渲染在 portal 中，登出按鈕透過 form 屬性指向這個表單；沒有 JS 也能登出 */}
      <form id={logoutFormId} action={logout} className="hidden" />
      <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-1" />}>
        <User aria-hidden />
        <span className="hidden max-w-28 truncate sm:inline">{name}</span>
        <span className="sr-only sm:hidden">帳號選單</span>
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate font-medium text-foreground">{name}</p>
            <p className="truncate text-xs font-normal">{email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/orders" />}>
          <Package aria-hidden />
          我的訂單
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <LayoutDashboard aria-hidden />
            後台管理
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          nativeButton
          render={<button type="submit" form={logoutFormId} className="w-full" />}
        >
          <LogOut aria-hidden />
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
