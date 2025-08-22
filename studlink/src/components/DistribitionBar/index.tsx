import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Segment } from '../../components/Segment'
import { getViewDialoguesRoute } from '../../lib/routes'
import css from './index.module.scss'

export const NewDistributionPage = () => {
  const [state, setState] = useState({
    coures: '',
    department: '',
    directions: '',
    group: '',
  })

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <ul className={css.menu}>
          <Segment title="Новая рассылка">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                console.info('Submitted', state)
              }}
            >
              <li className={css.item}>
                <div style={{ marginBottom: 10 }} className={css.ideas}>
                  <Link className={css.link} to={getViewDialoguesRoute()}>
                    Work Desk
                  </Link>
                  <label htmlFor="coures">Курс</label>
                  <br />
                  {['1', '2', '3', '4'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      style={{ marginRight: 5 }}
                      onClick={() => setState({ ...state, coures: num })}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="text"
                    onChange={(e) => {
                      setState({ ...state, coures: e.target.value })
                    }}
                    value={state.coures}
                    name="coures"
                    id="coures"
                  />
                  <select id="coures">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </li>
              <li className={css.item}>
                <div style={{ marginBottom: 10 }}>
                  <label htmlFor="department">Кафедра</label>
                  <br />
                  {['TTФ', 'ФЛиСХ'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      style={{ marginRight: 5 }}
                      onClick={() => setState({ ...state, department: num })}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="text"
                    onChange={(e) => {
                      setState({ ...state, department: e.target.value })
                    }}
                    value={state.department}
                    name="department"
                    id="department"
                  />
                  <select id="department" onChange={(e) => setState({ ...state, department: e.target.value })}>
                    <option value="TTФ">TTФ</option>
                    <option value="ФЛиСХ">ФЛиСХ</option>
                  </select>
                </div>
              </li>
              <li className={css.item}>
                <div style={{ marginBottom: 10 }}>
                  <label htmlFor="directions">Направление</label>
                  <br />
                  {['...'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      style={{ marginRight: 5 }}
                      onClick={() => setState({ ...state, directions: num })}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="text"
                    onChange={(e) => {
                      setState({ ...state, directions: e.target.value })
                    }}
                    value={state.directions}
                    name="directions"
                    id="directions"
                  />
                  <select id="directions" onChange={(e) => setState({ ...state, directions: e.target.value })}>
                    <option value="...">...</option>
                    <option value="...">...</option>
                  </select>
                </div>
              </li>
              <li className={css.item}>
                <div style={{ marginBottom: 10 }}>
                  <label htmlFor="group">Группа</label>
                  <br />
                  {['...'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      style={{ marginRight: 5 }}
                      onClick={() => setState({ ...state, directions: num })}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="text"
                    onChange={(e) => {
                      setState({ ...state, group: e.target.value })
                    }}
                    value={state.group}
                    name="group"
                    id="group"
                  />
                  <select id="group" onChange={(e) => setState({ ...state, group: e.target.value })}>
                    <option value="...">...</option>
                    <option value="...">...</option>
                  </select>
                </div>
              </li>
              <button type="submit">Отправить</button>
            </form>
          </Segment>
        </ul>
      </div>
    </div>
  )
}
