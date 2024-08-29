interface Button {
    text: string,
    onClick?: () => any,
    style?: string,
    loading?: boolean
}

export default function Button({text, onClick, style, loading}: Button) {
    return (
        <button
            disabled={loading}
            onClick={onClick}
            type={onClick ? `button` : `submit`}
            className={`w-full flex items-center justify-center gap-2 bg-blurple hover:bg-blurple-hover active:bg-blurple-active disabled:bg-blurple-active text-white p-2 rounded`}
        >
            {loading && <img src="/icons/loading.svg" className="size-4 animate-spin" alt="loading"></img>}
            {text}
        </button>
    )
}