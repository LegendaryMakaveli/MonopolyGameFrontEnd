import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const unwrapData = (response) => {
    if (!response) return response;
    return response.data !== undefined ? response.data : response;
};

export const monopolyApi = createApi({
    reducerPath: 'monopolyApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    tagTypes: ['Game', 'Player', 'Leaderboard', 'Admin'],
    endpoints: (builder) => ({

        createGame: builder.mutation({
            query: () => ({
                url: 'monopoly/games/createGame',
                method: 'POST',
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),

        joinGame: builder.mutation({
            query: ({ gameCode, playerName }) => ({
                url: `monopoly/games/${gameCode}/join`,
                method: 'POST',
                body: { playerName },
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),

        startGame: builder.mutation({
            query: (gameCode) => ({
                url: `monopoly/games/${gameCode}/start`,
                method: 'POST',
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),

        getGame: builder.query({
            query: (gameCode) => `monopoly/games/${gameCode}`,
            providesTags: ['Game'],
            transformResponse: unwrapData,
        }),

        pickHousing: builder.mutation({
            query: ({ playerId, housingType }) => ({
                url: `monopoly/games/players/${playerId}/housing`,
                method: 'POST',
                body: { housingType },
            }),
            invalidatesTags: ['Game'],
            transformResponse: unwrapData,
        }),

        playRound: builder.mutation({
            query: ({ playerId, loanPaymentNaira }) => ({
                url: `monopoly/rounds/players/${playerId}/play`,
                method: 'POST',
                body: { loanPaymentNaira },
            }),
            invalidatesTags: ['Game', 'Leaderboard', 'Admin'],
            transformResponse: unwrapData,
        }),

        getLeaderboard: builder.query({
            query: ({ gameCode, roundNumber }) =>
                `monopoly/rounds/${gameCode}/leaderboard/${roundNumber}`,
            providesTags: ['Leaderboard'],
            transformResponse: unwrapData,
        }),

        getPlayerHistory: builder.query({
            query: (playerId) => `monopoly/players/${playerId}/history`,
            providesTags: ['Player'],
            transformResponse: unwrapData,
        }),

        previewLoan: builder.mutation({
            query: ({ playerId, proposedPaymentNaira }) => ({
                url: `monopoly/players/${playerId}/loan/preview`,
                method: 'POST',
                body: { proposedPaymentNaira },
            }),
            transformResponse: unwrapData,
        }),


        getAllGames: builder.query({
            query: () => 'monopoly/admin/games',
            providesTags: ['Admin'],
            transformResponse: unwrapData,
        }),

        getAllPlayers: builder.query({
            query: () => 'monopoly/admin/players',
            providesTags: ['Admin'],
            transformResponse: unwrapData,
        }),

        deletePlayer: builder.mutation({
            query: (playerId) => ({
                url: `monopoly/admin/players/${playerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),

        deleteAllPlayersInGame: builder.mutation({
            query: (gameCode) => ({
                url: `monopoly/admin/games/${gameCode}/players`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),

        deleteGame: builder.mutation({
            query: (gameCode) => ({
                url: `monopoly/admin/games/${gameCode}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Admin'],
            transformResponse: unwrapData,
        }),

        forceEndGame: builder.mutation({
            query: (gameCode) => ({
                url: `monopoly/admin/games/${gameCode}/force-end`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Game', 'Admin'],
            transformResponse: unwrapData,
        }),
    }),
});

export const {
    useCreateGameMutation,
    useJoinGameMutation,
    useStartGameMutation,
    useGetGameQuery,
    usePickHousingMutation,
    usePlayRoundMutation,
    useGetLeaderboardQuery,
    useGetPlayerHistoryQuery,
    usePreviewLoanMutation,
    useGetAllGamesQuery,
    useGetAllPlayersQuery,
    useDeletePlayerMutation,
    useDeleteAllPlayersInGameMutation,
    useDeleteGameMutation,
    useForceEndGameMutation,
} = monopolyApi;
