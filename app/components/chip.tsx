type ChipProps = {
  title: string;
  icon: string;
};

function Chip({ title, icon }: ChipProps) {
  return (
    <div className="chip">
      <img src={icon} alt={title} width={15} height={15} />
      <span className="ml-2">{title}</span>
    </div>
  );
}

export default Chip;
