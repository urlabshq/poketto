import { SVGProps } from 'react';

export function CollectionBookmarkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M8 16h12V4h-2v6.125q0 .3-.25.437q-.25.138-.5-.012L15.5 9.5l-1.75 1.05q-.25.15-.5.012q-.25-.137-.25-.437V4H8v12Zm0 2q-.825 0-1.412-.587Q6 16.825 6 16V4q0-.825.588-1.413Q7.175 2 8 2h12q.825 0 1.413.587Q22 3.175 22 4v12q0 .825-.587 1.413Q20.825 18 20 18Zm-4 4q-.825 0-1.412-.587Q2 20.825 2 20V7q0-.425.288-.713Q2.575 6 3 6t.713.287Q4 6.575 4 7v13h13q.425 0 .712.288q.288.287.288.712t-.288.712Q17.425 22 17 22Zm9-18h5ZM8 4h12Z"
      ></path>
    </svg>
  );
}
