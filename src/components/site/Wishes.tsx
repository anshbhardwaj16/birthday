import { H2 } from "./Section";
import Marquee from "./Marquee";
import { content } from "@/config/content";

type Wish = (typeof content.wishes)[number];

function Card({ wish, index }: { wish: Wish; index: number }) {
  return (
    <figure
      className="mx-4 w-[min(80vw,24rem)] shrink-0 border-2 border-ink bg-milk p-6 text-ink shadow-[7px_7px_0_var(--color-ink)]"
      style={{ rotate: `${(index % 3 - 1) * 1.1}deg` }}
    >
      <blockquote className="voice text-[clamp(1.35rem,2vw,1.7rem)] leading-[1.25]">&ldquo;{wish.text}&rdquo;</blockquote>
      <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-2">
        <span className="display text-lg">{wish.from}</span>
        <span className="voice text-lg text-ink/60">{wish.note}</span>
      </figcaption>
    </figure>
  );
}

/** Repeat the list until a single pass is wider than a wide screen, so the loop never shows a gap. */
function fill(list: Wish[]) {
  const copies = Math.max(1, Math.ceil(6 / list.length));
  return Array.from({ length: copies }, () => list).flat();
}

export default function Wishes() {
  const wishes = content.wishes;
  const half = Math.ceil(wishes.length / 2);
  const rowA = fill(wishes.slice(0, half));
  const rowB = fill(wishes.slice(half).length ? wishes.slice(half) : wishes);

  return (
    <section id="wishes" className="overflow-hidden bg-tangerine py-[clamp(4.5rem,11vw,10rem)]">
      <div className="px-[clamp(1.1rem,4vw,4rem)]">
        <div className="mx-auto max-w-[78rem]">
          <h2 className={`${H2} max-w-[14ch]`}>From the people who adore you.</h2>
        </div>
      </div>

      <div className="mt-[clamp(2.5rem,6vw,5rem)] space-y-8 py-3">
        <Marquee duration={70} className="motion-reduce:overflow-x-auto">
          {rowA.map((w, i) => (
            <Card key={i} wish={w} index={i} />
          ))}
        </Marquee>
        <Marquee duration={84} reverse className="motion-reduce:overflow-x-auto">
          {rowB.map((w, i) => (
            <Card key={i} wish={w} index={i + 1} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
