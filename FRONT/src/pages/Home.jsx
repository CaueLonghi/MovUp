import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import movup_logo from '../assets/movup_logo.png';
import poster from '../assets/poster.jpeg';
import 'primeicons/primeicons.css';

const Home = () => {
  const features = [
    { icon: 'pi pi-check-square', title: 'Análise'},
    { icon: 'pi pi-trophy', title: 'Performance'},
    { icon: 'pi pi-chart-line', title: 'Métricas'},
    { icon: 'pi pi-camera', title: 'Gravação'},
    { icon: 'pi pi-users', title: 'Comunidade' },
    { icon: 'pi pi-star', title: 'Avaliações'}
  ];

  return (
    <div className="page-container">

        {/* Feature Grid com Containers Amarelos - Galeria */}
        <div className="gallery-grid">
          {features.map((feature, index) => (
            <div key={index} className="icon-container">
              <i className={`${feature.icon} text-black`}></i>
              <h3 className="text-black">{feature.title}</h3>
            </div>
          ))}
        </div>

        {/* História do movUP */}
        <Card className="mb-4 bg-yellow-100 border-round-lg p-3">
          <div className="text-left">
            <h2 className="text-lg font-bold text-black mb-3">História do movUP</h2>
            <p className="text-black-alpha-80 line-height-3 text-sm">
            O MovUP nasceu de forma simples, espontânea e muito parecida com a jornada de muitos corredores amadores. Tudo começou quando três colegas de faculdade — inicialmente apenas conhecidos de sala — passaram a se reunir semanalmente para correr. O que era só uma forma de aliviar o estresse da graduação acabou se tornando um hábito, fortalecendo uma amizade e despertando um interesse crescente pela própria evolução na corrida.
            <br/>
            <br/>
            Com o tempo, o grupo começou a buscar maneiras de melhorar sua técnica. Porém, como a maioria dos corredores recreativos, eles não tinham acesso fácil a avaliações biomecânicas ou acompanhamento especializado. A curiosidade e a vontade de evoluir os levaram a gravar suas corridas na esteira para observar a postura, o impacto da pisada e a regularidade da passada.
            <br/>
            <br/>
            Foi nesse momento que surgiu a ideia: “Por que não criar uma ferramenta acessível, automatizada e capaz de analisar nossa própria corrida?”
            <br/>
            <br/>
            Da união entre a prática esportiva, a amizade e o conhecimento em tecnologia, nasceu o MovUP — um aplicativo pensado para ajudar corredores reais, em condições reais, a entenderem melhor sua técnica e reduzirem o risco de lesões.
            <br/>
            <br/>
            O projeto cresceu, ganhou estrutura, base científica e modelo computacional robusto, mas manteve sua essência: democratizar a análise biomecânica, tornando acessível aquilo que antes dependia de clínicas especializadas. O MovUP representa a junção da paixão por correr com a vontade de transformar tecnologia em algo útil, prático e funcional — começando por três amigos que só queriam correr melhor.
            </p>
            <br />
            <div className="text-center mt-3">
              <img src={poster} alt="" className='image-poster' />
            </div>
          </div>
        </Card>
    </div>
  );
};

export default Home;
