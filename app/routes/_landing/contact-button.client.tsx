import Image from "~/components/image";

function ContactButton() {
  return (
    <button className="uppercase font-medium !mt-12 bg-primary hover:bg-secondary transition-all duration-200 rounded-full text-xs w-full py-2 gap-1 flex items-center justify-center">
      <Image src="/icons/mail.svg" width={20} height={20} alt="Mail" />
      <span>Me contacter</span>
    </button>
  );
}

export default ContactButton;
