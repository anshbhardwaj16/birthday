import clsx from "clsx";

/** Shared section frame: consistent gutters, rhythm and max width. */
export default function Section({
  id,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={clsx("px-[clamp(1.1rem,4vw,4rem)] py-[clamp(4.5rem,11vw,10rem)]", className)}
    >
      <div className={clsx("mx-auto max-w-[78rem]", innerClassName)}>{children}</div>
    </section>
  );
}

/** The poster-sized section heading. */
export const H2 = "poster text-[clamp(3.2rem,8.6vw,7.6rem)]";
