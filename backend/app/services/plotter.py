import plotly.express as px
import numpy as np

def plot_degradation_curve(laps, driver):
    driver_laps = laps[laps['Driver'] == driver]


    fig = px.line(
        driver_laps,
        x='TyreLife',
        y='SmoothedLapTime',
        color='Compound',
        line_group='Stint',
        title=f"Tyre Degradation - {driver}"
    )

    fig.update_layout(
    title={
        'text': f"Tyre Degradation Curve - {driver}",
        'x': 0.5
    },
    xaxis_title="Tyre Life (laps)",
    yaxis_title="Lap Time (seconds)",
    template="plotly_dark",
    legend_title="Compound",
)
    for stint in driver_laps['Stint'].unique():
        stint_data = driver_laps[driver_laps['Stint'] == stint]

        if len(stint_data) > 5:
            x = stint_data['TyreLife']
            y = stint_data['SmoothedLapTime']

            z = np.polyfit(x, y, 1)
            p = np.poly1d(z)

            fig.add_scatter(
                x=x,
                y=p(x),
                mode='lines',
                name=f"Trend Stint {int(stint)}",
                line=dict(dash='dash')
            )

    fig.update_traces(mode='lines+markers')

    fig.show()

def compare_drivers(laps, drivers):
    filtered = laps[laps['Driver'].isin(drivers)].copy()

    filtered['Label'] = filtered['Driver'] + " (" + filtered['Compound'] + ")"

    fig = px.line(
        filtered,
        x='TyreLife',
        y='SmoothedLapTime',
        color='Label',
        title="Driver Tyre Degradation Comparison"
    )

    fig.update_layout(
        template="plotly_dark",
        xaxis_title="Tyre Life (laps)",
        yaxis_title="Lap Time (seconds)",
        legend_title="Driver (Line) | Compound (Style)"
    )

    peak_row = filtered.loc[filtered['SmoothedLapTime'].idxmin()]

    for driver in drivers:
        driver_data = filtered[filtered['Driver'] == driver]

        peak_row = driver_data.loc[driver_data['SmoothedLapTime'].idxmin()]

        fig.add_annotation(
            x=peak_row['TyreLife'],
            y=peak_row['SmoothedLapTime'],
            text=f"{driver} peak",
            showarrow=True,
            arrowhead=2,
            yshift=10
        )

    mid_point = filtered['TyreLife'].quantile(0.4)

    fig.add_vrect(
        x0=0,
        x1=mid_point,
        fillcolor="green",
        opacity=0.1,
        layer="below",
        line_width=0,
    )

    fig.add_vrect(
        x0=mid_point,
        x1=filtered['TyreLife'].max(),
        fillcolor="red",
        opacity=0.1,
        layer="below",
        line_width=0,
    )

    fig.update_layout(
        title={
            'text': "Driver Tyre Degradation Comparison<br><sub>Comparing tyre performance across drivers and compounds</sub>",
            'x': 0.5
        }
    )

    fig.show()

