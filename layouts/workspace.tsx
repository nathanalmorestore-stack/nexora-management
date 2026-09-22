/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import Head from "next/head";
import Sidebar from "@/components/sidebar";
import type { LayoutProps } from "@/layoutTypes";
import axios from "axios";
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { useRouter } from "next/router";
import WorkspaceBirthdayPrompt from '@/components/bdayprompt';
import { useEffect, useState } from "react";
import { IconChevronRight, IconCircleCheck, IconCloudOff, IconMenu2 } from "@tabler/icons-react";
import clsx from 'clsx';

const workspace: LayoutProps = ({ children }) => {
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const routeWorkspaceId = Number(router.query.id);
	const workspaceReady = routeWorkspaceId > 0 && workspace.groupId === routeWorkspaceId;

	useEffect(() => {
		router.events.on("routeChangeStart", () => setLoading(true));
		router.events.on("routeChangeComplete", () => setLoading(false));
	}, [router.events]);

	useEffect(() => {
		async function getworkspace() {
			try {
				const res = await axios.get("/api/workspace/" + router.query.id);
				setWorkspace(res.data.workspace);
			} catch (e: any) {
				router.push("/");
			}
		}
		if (router.query.id) getworkspace();
	}, [router.query.id, setWorkspace]);


	return (
		<div className="h-screen bg-zinc-50 dark:bg-zinc-950">
			<Head>
				<title>{workspace.groupName ? `Nexora Management - ${workspace.groupName}` : "Loading..."}</title>
				<link rel="icon" href={`${workspace.groupThumbnail}`} />
			</Head>
				{!workspaceReady ? (
					<div className="flex h-screen items-center justify-center bg-[#f7f8fa] dark:bg-[#0b0c0f]">
						<div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-primary dark:border-zinc-700" />
							Loading workspace…
						</div>
					</div>
				) : <div className="flex h-screen overflow-hidden">
					<Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

					<main
						className={clsx(
							"workspace-surface flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#f7f8fa] transition-all duration-300 dark:bg-[#0b0c0f]",
							"pb-20 lg:pb-0"
						)}
					>
						<header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-200/80 bg-[#f7f8fa]/80 px-5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-[#0b0c0f]/80 sm:px-8">
							<div className="flex min-w-0 items-center gap-2 text-sm">
								<button
									type="button"
									onClick={() => router.push("/")}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 lg:hidden"
									aria-label="Back to workspaces"
								>
									<IconMenu2 className="h-4 w-4" stroke={1.8} />
								</button>
								<button
									type="button"
									onClick={() => router.push("/")}
									className="hidden font-medium text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white sm:block"
								>
									Workspaces
								</button>
								<IconChevronRight className="hidden h-4 w-4 text-zinc-300 dark:text-zinc-700 sm:block" stroke={2} />
								<div className="flex min-w-0 items-center gap-2">
									{workspace.groupThumbnail ? (
										<img src={workspace.groupThumbnail} alt="" className="h-7 w-7 rounded-lg object-cover" />
									) : null}
									<span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
										{workspace.customName || workspace.groupName || "Workspace"}
									</span>
								</div>
							</div>
							<div className="flex shrink-0 items-center gap-3">
								<div className="hidden items-center gap-1.5 text-xs text-zinc-400 sm:flex">
									{workspace.lastSyncedSuccessful ? (
										<IconCircleCheck className="h-4 w-4 text-emerald-500" stroke={2} />
									) : (
										<IconCloudOff className="h-4 w-4 text-amber-500" stroke={1.8} />
									)}
									<span>{workspace.lastSyncedSuccessful ? "Synced" : "Sync attention"}</span>
								</div>
								<span className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
								<span className="hidden rounded-full border border-zinc-200 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/70 sm:inline-flex">Nexora Management</span>
							</div>
						</header>
						<div className="relative z-10 min-w-0 flex-1">
							{children}
						</div>
						{router.query.id && (
							<WorkspaceBirthdayPrompt workspaceId={router.query.id as string} />
						)}
					</main>
				</div>}
		</div>
	);
};

export default workspace;
