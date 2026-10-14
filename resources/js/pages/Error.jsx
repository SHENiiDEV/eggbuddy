import { Head, Link } from '@inertiajs/react';
import { PetSprite } from '../game/PixelArt.jsx';
import { withLayout } from '../layouts/AppLayout.jsx';

const COPY = {
  403: ['No peeking!', 'You don’t have access to this page.'],
  404: ['Lost in the shell', 'We couldn’t find that page. It may have hatched and wandered off.'],
  429: ['Whoa, slow down', 'Too many requests. Take a breath and try again in a moment.'],
  500: ['Something went poof', 'Our servers tripped over a poop. We’re on it, please try again shortly.'],
  503: ['Nap time', 'We’re doing a little maintenance. Back very soon.'],
};

export default function ErrorPage({ status }) {
  const [title, text] = COPY[status] ?? COPY[500];
  return (
    <>
      <Head title={title} />
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <div className="rounded-3xl border-[3px] border-ink bg-lcd px-10 py-8 shadow-toy">
          <PetSprite skin="boo" stage="adult" mood={status === 503 ? 'sleeping' : 'sad'} scale={7} />
        </div>
        <p className="pixel mt-8 text-sm text-pink-deep">Error {status}</p>
        <h1 className="mt-2 font-display text-5xl font-bold">{title}</h1>
        <p className="mt-3 text-lg text-ink-soft">{text}</p>
        <Link href="/" className="btn btn-primary mt-8">Take me home</Link>
      </div>
    </>
  );
}

ErrorPage.layout = withLayout;
