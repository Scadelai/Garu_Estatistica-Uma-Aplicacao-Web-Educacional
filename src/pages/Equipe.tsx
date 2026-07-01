import { Text, Paper } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';

import camilaImg from '../assets/images/camila.jpg';
import flaviaImg from '../assets/images/flavia.jpg';
import gabrielImg from '../assets/images/gabriel.jpg';
import joaoImg from '../assets/images/joao.jpg';
import pauloImg from '../assets/images/paulopaiva.jpg';
import leonardoImg from '../assets/images/leonardo.png';

interface TeamMember {
  name: string;
  image: string;
  affiliations: string[];
}

const teamRow1: TeamMember[] = [
  {
    name: 'Camila Bertini Martins',
    image: camilaImg,
    affiliations: [
      'Epidemiologia e Bioestatística',
      'Medicina Preventiva, UNIFESP',
    ],
  },
  {
    name: 'Flávia Cristina Martins Queiroz Mariano',
    image: flaviaImg,
    affiliations: [
      'Instituto de Ciência e Tecnologia',
      'ICT-UNIFESP',
    ],
  },
];

const teamRow2: TeamMember[] = [
  {
    name: 'Gabriel Graciano Dias',
    image: gabrielImg,
    affiliations: [
      'Graduação em Biomedicina',
      'UNIFESP',
    ],
  },
  {
    name: 'João Henrique de Araújo Morais',
    image: joaoImg,
    affiliations: [
      'Graduação em Ciência e Tecnologia',
      'Graduação em Ciência da Computação',
      'ICT-UNIFESP',
    ],
  },
  {
    name: 'Paulo Bandiera Paiva',
    image: pauloImg,
    affiliations: [
      'Informática e Saúde',
      'UNIFESP',
    ],
  },
  {
    name: 'Leonardo Scadelai',
    image: leonardoImg,
    affiliations: [
      'Graduação em Ciência e Tecnologia',
      'Graduação em Engenharia da Computação',
      'ICT-UNIFESP',
    ],
  },
];

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <Paper shadow="xs" p="lg" withBorder style={{ textAlign: 'center', width: 220, margin: '0 12px 20px' }}>
      <img
        src={member.image}
        alt={member.name}
        style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
      <Text fw={700} mt="sm">
        {member.name}
      </Text>
      {member.affiliations.map((line, i) => (
        <Text size="sm" c="dimmed" key={i}>
          {line}
        </Text>
      ))}
    </Paper>
  );
}

export default function Equipe() {
  return (
    <PageWrapper title="Equipe" color="gray">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {teamRow1.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {teamRow2.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </PageWrapper>
  );
}
