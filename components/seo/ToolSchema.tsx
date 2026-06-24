type Props = {
  name: string;
  description: string;
  path: string;
  category?: string | undefined;
};

export default function ToolSchema({ name, description, path }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `ابزار فارسی - ${name}`,
    description,
    url: `https://persiantoolbox.ir${path}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IRR',
    },
    inLanguage: 'fa-IR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
