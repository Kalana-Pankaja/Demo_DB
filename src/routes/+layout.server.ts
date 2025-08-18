export const load = async ({ url }: { url: URL }) => {
	return {
		url: {
			pathname: url.pathname
		}
	};
};