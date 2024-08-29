import localFont from "next/font/local";

export const GGSans = localFont({
    src: [
        {
            path: 'GG-Sans-Regular.ttf',
            weight: '400',
            style: 'normal',
        },
        {
            path: 'GG-Sans-Medium.ttf',
            weight: '500',
            style: 'normal',
        },
        {
            path: 'GG-Sans-Semibold.ttf',
            weight: '600',
            style: 'normal',
        },
        {
            path: 'GG-Sans-Bold.ttf',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-sans'
})