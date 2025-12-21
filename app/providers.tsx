"use client"; // Mark this as a Client Component

import store from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

export default function Providers({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>{children}</Provider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
